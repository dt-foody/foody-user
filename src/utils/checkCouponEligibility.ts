// src/utils/checkCouponEligibility.ts

import _ from "lodash";
import type { Coupon } from "@/types/coupon"; // Import type Coupon của dự án bạn
import { Customer, Employee } from "@/types";

// =============================================================================
// 1. TYPE DEFINITIONS
// =============================================================================

// Context dữ liệu giỏ hàng
export type CartData = {
  items: {
    productId: string;
    quantity: number;
    price: number;
    categoryIds?: string[];
  }[];
  subtotal: number;
  total?: number;
};

// Cấu trúc Node điều kiện chuẩn (Internal Use)
export interface ConditionNode {
  operator?: string; // AND, OR, EQUALS, GREATER_THAN...
  conditions?: ConditionNode[];
  fieldId?: string;
  value?: any;
}

// Kết quả trả về
export type EligibilityStatus =
  | { isEligible: true; reason: null }
  | { isEligible: false; reason: string };

// Context dùng trong lúc chạy hàm evaluate
interface EvaluationContext {
  customer: Customer | Employee | null;
  order: {
    items: CartData["items"];
    total: number;
    subtotal: number;
    categoryIds: string[];
  };
}

// =============================================================================
// 2. DATA NORMALIZATION (Adapter cho cấu trúc cũ/mới)
// =============================================================================

/**
 * Chuyển đổi mọi định dạng (Array, Legacy Object) về chuẩn ConditionNode
 */
function normalizeCondition(node: any): ConditionNode {
  // 1. Nếu là Array [] -> Mặc định là nhóm AND
  if (Array.isArray(node)) {
    return {
      operator: "AND",
      conditions: node.map(normalizeCondition),
    };
  }

  // 2. Check null/empty
  if (!node || typeof node !== "object") {
    return {};
  }

  // 3. Legacy format: { and: [...] }
  if ("and" in node && Array.isArray(node.and)) {
    return {
      operator: "AND",
      conditions: node.and.map(normalizeCondition),
    };
  }

  // 4. Legacy format: { or: [...] }
  if ("or" in node && Array.isArray(node.or)) {
    return {
      operator: "OR",
      conditions: node.or.map(normalizeCondition),
    };
  }

  // 5. Leaf Node (Điều kiện đơn)
  // Support cả 'fieldId' (mới) và 'field' (cũ)
  if ("fieldId" in node || "field" in node) {
    return {
      fieldId: node.fieldId || node.field,
      operator: node.operator,
      value: node.value,
      // Đệ quy nếu bên trong leaf lại có conditions (ít gặp)
      conditions: node.conditions
        ? node.conditions.map(normalizeCondition)
        : undefined,
    };
  }

  // 6. Standard format (đã chuẩn)
  if ("operator" in node && Array.isArray(node.conditions)) {
    return {
      ...node,
      conditions: node.conditions.map(normalizeCondition),
    };
  }

  return {}; // Fallback
}

// =============================================================================
// 3. FIELD RESOLVERS (Mapper dữ liệu - GIỐNG BACKEND)
// =============================================================================

const FIELD_RESOLVERS: Record<string, (ctx: EvaluationContext) => any> = {
  // --- CUSTOMER INFO ---
  customer_name: (ctx) => ctx.customer?.name || "",
  customer_gender: (ctx) => ctx.customer?.gender || "",

  customer_age: (ctx) => {
    const dob = ctx.customer?.birthDate;
    if (!dob) return null;
    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  },

  customer_birth_month: (ctx) => {
    const dob = ctx.customer?.birthDate;
    if (!dob) return null;
    return new Date(dob).getMonth() + 1; // +1 vì tháng bắt đầu từ 0
  },

  customer_birth_year: (ctx) => {
    const dob = ctx.customer?.birthDate;
    if (!dob) return null;
    return new Date(dob).getFullYear();
  },

  customer_order_count: (ctx) => ctx.customer?.orderCount || 0,
  customer_total_spent: (ctx) => ctx.customer?.totalSpent || 0,

  // --- ORDER CONTEXT ---
  order_total_amount: (ctx) => ctx.order.subtotal,

  order_total_items: (ctx) => {
    return ctx.order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  },

  // Trả về mảng category của các item trong giỏ
  order_category_ids: (ctx) => ctx.order.categoryIds,
};

// =============================================================================
// 4. OPERATOR STRATEGIES (Logic so sánh)
// =============================================================================

const OPERATORS: Record<string, (a: any, b: any) => boolean> = {
  // --- Text ---
  EQUALS: (a, b) => String(a) == String(b), // Loose comparison (18 == "18")
  NOT_EQUALS: (a, b) => String(a) != String(b),
  CONTAINS: (a, b) =>
    String(a || "")
      .toLowerCase()
      .includes(String(b || "").toLowerCase()),

  // --- Boolean / Existence ---
  IS_EMPTY: (a) => a === null || a === undefined || a === "",
  IS_NOT_EMPTY: (a) => a !== null && a !== undefined && a !== "",
  IS_TRUE: (a) => a === true,
  IS_FALSE: (a) => a === false,

  // --- Number (Safe Check - Return false if null) ---
  GREATER_THAN: (a, b) => (a == null ? false : Number(a) > Number(b)),
  LESS_THAN: (a, b) => (a == null ? false : Number(a) < Number(b)),
  GREATER_THAN_OR_EQUALS: (a, b) =>
    a == null ? false : Number(a) >= Number(b),
  LESS_THAN_OR_EQUALS: (a, b) => (a == null ? false : Number(a) <= Number(b)),

  // --- Array / List ---
  IN: (a, b) => {
    // a: Giá trị cần check (vd: categoryId của món hàng)
    // b: Danh sách cho phép (vd: ["cat1", "cat2"] hoặc "cat1, cat2")
    const list = Array.isArray(b)
      ? b
      : String(b)
          .split(",")
          .map((i) => i.trim());
    return list.includes(String(a));
  },

  NOT_IN: (a, b) => {
    const list = Array.isArray(b)
      ? b
      : String(b)
          .split(",")
          .map((i) => i.trim());
    return !list.includes(String(a));
  },

  // Kiểm tra giao nhau giữa 2 mảng (Giỏ hàng có chứa danh mục nào trong danh sách khuyến mãi không)
  INTERSECT: (a, b) => {
    if (!Array.isArray(a)) return false; // a phải là mảng category của order
    const listB = Array.isArray(b)
      ? b
      : String(b)
          .split(",")
          .map((i) => i.trim());
    return a.some((item) => listB.includes(item));
  },
};

// Helper map tên operator rút gọn
function mapOperatorName(op?: string): string {
  if (!op) return "EQUALS";
  const u = op.toUpperCase();
  const map: Record<string, string> = {
    "=": "EQUALS",
    "!=": "NOT_EQUALS",
    ">": "GREATER_THAN",
    ">=": "GREATER_THAN_OR_EQUALS",
    "<": "LESS_THAN",
    "<=": "LESS_THAN_OR_EQUALS",
    IN: "IN",
    NIN: "NOT_IN",
    CONTAINS: "CONTAINS",
  };
  return map[u] || u;
}

// =============================================================================
// 5. CORE EVALUATOR (Đệ quy)
// =============================================================================

function evaluateNode(node: ConditionNode, ctx: EvaluationContext): boolean {
  // 1. Empty check
  if (!node || _.isEmpty(node)) return true;

  // 2. Group Logic (AND/OR)
  if (node.conditions && Array.isArray(node.conditions)) {
    if (node.conditions.length === 0) return true; // Rỗng = True

    const op = (node.operator || "AND").toUpperCase();

    if (op === "OR") {
      return node.conditions.some((sub) => evaluateNode(sub, ctx));
    }
    // Default: AND
    return node.conditions.every((sub) => evaluateNode(sub, ctx));
  }

  // 3. Leaf Logic
  const { fieldId, operator, value } = node;

  // Resolver
  const resolver = FIELD_RESOLVERS[fieldId || ""];
  if (!resolver) {
    // console.warn(`[CouponLogic] Unknown fieldId: ${fieldId}`);
    // Return false hoặc true tùy policy, ở đây false cho an toàn
    return false;
  }

  // Get Value
  let actualValue;
  try {
    actualValue = resolver(ctx);
  } catch (e) {
    console.error(`[CouponLogic] Error resolving ${fieldId}`, e);
    return false;
  }

  // User Check: Nếu field cần user info mà user null -> Coi như không thỏa
  if (fieldId?.startsWith("customer_") && ctx.customer === null) {
    return false;
  }

  // Operator
  const opKey = mapOperatorName(operator);
  const compareFn = OPERATORS[opKey];

  if (!compareFn) {
    console.warn(`[CouponLogic] Unknown operator: ${operator}`);
    return false;
  }

  return compareFn(actualValue, value);
}

// Helper: Kiểm tra nhanh xem cây điều kiện có yêu cầu đăng nhập không
function requiresLogin(node: ConditionNode): boolean {
  if (node.fieldId && node.fieldId.startsWith("customer_")) return true;
  if (node.conditions) return node.conditions.some(requiresLogin);
  return false;
}

// =============================================================================
// 6. MAIN EXPORT FUNCTION
// =============================================================================

export const checkCouponEligibility = (
  coupon: Coupon,
  cart: CartData,
  user: Employee | Customer | null
): EligibilityStatus => {
  // A. Check cứng (Min Order Amount)
  if (coupon.minOrderAmount && cart.subtotal < coupon.minOrderAmount) {
    return {
      isEligible: false,
      reason: `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString()}đ`,
    };
  }

  // B. Nếu không có điều kiện động -> Hợp lệ
  if (!coupon.conditions || _.isEmpty(coupon.conditions)) {
    return { isEligible: true, reason: null };
  }

  // C. Chuẩn bị Context
  const categoryIds = Array.from(
    new Set(cart.items.flatMap((i) => i.categoryIds || []))
  );

  const context: EvaluationContext = {
    customer: user,
    order: {
      items: cart.items,
      total: cart.total || cart.subtotal,
      subtotal: cart.subtotal,
      categoryIds: categoryIds,
    },
  };

  // D. Chuẩn hóa & Đánh giá
  // normalizeCondition chấp nhận 'any' để handle dữ liệu cũ từ DB
  const rootNode: ConditionNode = normalizeCondition(coupon.conditions);

  const passed = evaluateNode(rootNode, context);

  if (passed) {
    return { isEligible: true, reason: null };
  } else {
    // Trả về lý do lỗi cơ bản
    if (requiresLogin(rootNode) && !user) {
      return {
        isEligible: false,
        reason: "Vui lòng đăng nhập để sử dụng mã này",
      };
    }

    // Nếu muốn chi tiết hơn (vd: "Chỉ dành cho sinh nhật tháng 5"),
    // cần nâng cấp evaluateNode trả về object {pass, reason} thay vì boolean.
    // Hiện tại trả về lỗi chung để an toàn UI.
    return {
      isEligible: false,
      reason: "Đơn hàng không đủ điều kiện áp dụng mã",
    };
  }
};
