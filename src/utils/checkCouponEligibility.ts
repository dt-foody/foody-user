// src/utils/checkCouponEligibility.ts

import type { Coupon, CouponConditionClause } from "@/types/coupon";

// --- Types cho Context (Dữ liệu đầu vào để kiểm tra) ---
// Bổ sung orderCount vào UserData để check coupon "Khách hàng mới"
export type UserData = {
  isNew?: boolean;
  age?: number | null;
  orderCount?: number; // Số đơn hàng đã đặt trong quá khứ
};

export type CartData = {
  items: { categoryIds?: string[] }[];
  subtotal: number;
  total?: number;
};

export type EligibilityStatus =
  | { isEligible: true; reason: null }
  | { isEligible: false; reason: string };

// --- 1. Normalization Utils ---

/**
 * Chuẩn hóa các node điều kiện từ Backend về dạng Clause chuẩn
 * Backend trả về: { fieldId: "...", operator: "...", value: ... }
 */
function normalizeClause(node: any): CouponConditionClause | null {
  if (!node || typeof node !== "object") return null;

  // Trường hợp backend trả về 'fieldId' (Legacy)
  if ("fieldId" in node) {
    return {
      field: mapBackendFieldToContext(node.fieldId),
      operator: normalizeOperator(node.operator),
      value: node.value,
    };
  }

  // Trường hợp backend trả về 'field' (New standard)
  if ("field" in node) {
    return {
      field: node.field,
      operator: normalizeOperator(node.operator),
      value: node.value,
    };
  }

  return null;
}

/**
 * Map tên trường từ Backend (Snake_case) sang Frontend Context (Dot.notation)
 */
function mapBackendFieldToContext(fieldId: string): string {
  switch (fieldId) {
    case "order_count":
      return "user.orderCount"; // Map về lịch sử đơn hàng của user
    case "customer_age":
      return "user.age";
    case "customer_is_new":
      return "user.isNew";
    case "category_id":
      return "order.categoryIds";
    default:
      return fieldId; // Giữ nguyên nếu không khớp (vd: user.name)
  }
}

/**
 * Chuẩn hóa toán tử so sánh
 */
function normalizeOperator(op: string): CouponConditionClause["operator"] {
  const s = String(op).toUpperCase(); // Backend gửi EQUALS (upper)
  switch (s) {
    case "EQUALS":
    case "=":
      return "=";
    case "NOTEQUALS":
    case "!=":
      return "!=";
    case "GREATER_THAN":
    case ">":
      return ">";
    case "GREATER_THAN_OR_EQUALS":
    case ">=":
      return ">=";
    case "LESS_THAN":
    case "<":
      return "<";
    case "LESS_THAN_OR_EQUALS":
    case "<=":
      return "<=";
    case "IN":
      return "in";
    case "NOT_IN":
    case "NIN":
      return "nin";
    case "CONTAINS":
      return "contains";
    case "EXISTS":
      return "exists";
    default:
      return "=";
  }
}

// --- 2. Comparators ---

function compare(left: any, operator: string, right: any): boolean {
  switch (operator) {
    case "=":
      // Xử lý lỏng lẻo cho số và chuỗi (vd: "18" == 18)
      return left == right;
    case "!=":
      return left != right;
    case ">":
      return Number(left) > Number(right);
    case ">=":
      return Number(left) >= Number(right);
    case "<":
      return Number(left) < Number(right);
    case "<=":
      return Number(left) <= Number(right);
    case "in": {
      const arr = Array.isArray(right) ? right : [right];
      if (Array.isArray(left)) {
        // Giao nhau: [A, B] in [A, C] -> true
        return left.some((x) => arr.includes(x));
      }
      return arr.includes(left);
    }
    case "nin": {
      const arr = Array.isArray(right) ? right : [right];
      if (Array.isArray(left)) {
        return !left.some((x) => arr.includes(x));
      }
      return !arr.includes(left);
    }
    case "contains": {
      if (Array.isArray(left)) return left.includes(right);
      return String(left).includes(String(right));
    }
    default:
      return false;
  }
}

// --- 3. Evaluators ---

/**
 * Đánh giá một mệnh đề đơn (Lá)
 */
function evaluateClause(
  clause: CouponConditionClause,
  ctx: { user: UserData; cart: CartData; orderCtx: any }
): EligibilityStatus {
  const { field, operator, value } = clause;
  let leftValue: any;

  // Lấy giá trị thực tế từ context dựa trên field đã map
  switch (field) {
    // User Context
    case "user.orderCount":
      leftValue = ctx.user.orderCount ?? 0; // Mặc định 0 nếu không có data
      break;
    case "user.age":
      leftValue = ctx.user.age;
      break;
    case "user.isNew":
      leftValue = ctx.user.isNew;
      break;

    // Order/Cart Context
    case "order.categoryIds":
      leftValue = ctx.orderCtx.categoryIds;
      break;
    case "order.total":
      leftValue = ctx.cart.total;
      break;
    case "order.subtotal":
      leftValue = ctx.cart.subtotal;
      break;
    default:
      // Fallback lấy theo path object
      leftValue = undefined;
  }

  // Nếu thiếu dữ liệu User quan trọng (VD: chưa login), trả về false
  if (
    field.startsWith("user.") &&
    (leftValue === undefined || leftValue === null)
  ) {
    return { isEligible: false, reason: "LOGIN_REQUIRED" }; // Khớp với backend
  }

  const passed = compare(leftValue, operator, value);

  if (passed) return { isEligible: true, reason: null };

  // Tạo thông báo lỗi thân thiện
  if (field === "user.orderCount" && value === 0) {
    return { isEligible: false, reason: "Chỉ dành cho khách hàng mới" };
  }
  if (field === "user.age") {
    return { isEligible: false, reason: `Yêu cầu khách hàng ${value} tuổi` };
  }

  return { isEligible: false, reason: `Không thỏa điều kiện: ${field}` };
}

/**
 * Đánh giá đệ quy (Node gốc hoặc Nhóm)
 * Hỗ trợ format backend: { operator: "AND", conditions: [] }
 */
function evaluateNode(
  node: any,
  ctx: { user: UserData; cart: CartData; orderCtx: any }
): EligibilityStatus {
  // 1. Nếu node là nhóm (có mảng conditions)
  if (node.conditions && Array.isArray(node.conditions)) {
    const subConditions = node.conditions;
    // Nếu mảng rỗng -> Luôn đúng (Theo logic backend list rỗng là không có điều kiện)
    if (subConditions.length === 0) return { isEligible: true, reason: null };

    const op = String(node.operator || "AND").toUpperCase();

    if (op === "OR") {
      // OR: Chỉ cần 1 cái đúng
      for (const sub of subConditions) {
        const res = evaluateNode(sub, ctx);
        if (res.isEligible) return { isEligible: true, reason: null };
      }
      return { isEligible: false, reason: "Không thỏa bất kỳ điều kiện nào" };
    } else {
      // AND (Mặc định): Tất cả phải đúng
      for (const sub of subConditions) {
        const res = evaluateNode(sub, ctx);
        if (!res.isEligible) return res; // Return lỗi đầu tiên gặp
      }
      return { isEligible: true, reason: null };
    }
  }

  // 2. Nếu node là mệnh đề đơn (Clause)
  const clause = normalizeClause(node);
  if (clause) {
    return evaluateClause(clause, ctx);
  }

  return { isEligible: false, reason: "Cấu trúc điều kiện lỗi" };
}

// --- 4. Main Export ---

export const checkCouponEligibility = (
  coupon: Coupon,
  cart: CartData,
  user: UserData | null // Cho phép null để check login
): EligibilityStatus => {
  // A. Check cứng (Min Order Amount) - Luôn check trước
  if (coupon.minOrderAmount && cart.subtotal < coupon.minOrderAmount) {
    return {
      isEligible: false,
      reason: `Đơn tối thiểu ${coupon.minOrderAmount.toLocaleString("vi-VN")}đ`,
    };
  }

  // B. Check conditions động
  // Nếu không có conditions hoặc conditions rỗng
  if (
    !coupon.conditions ||
    (Array.isArray(coupon.conditions) && coupon.conditions.length === 0) ||
    // @ts-ignore Check trường hợp backend trả object rỗng hoặc mảng rỗng trong object
    (coupon.conditions.conditions && coupon.conditions.conditions.length === 0)
  ) {
    return { isEligible: true, reason: null };
  }

  // Chuẩn bị Context
  const categoryIds = Array.from(
    new Set(cart.items.flatMap((i) => i.categoryIds || []))
  );

  const safeUser: UserData = user || {}; // Nếu chưa login, user là object rỗng

  const ctx = {
    user: safeUser,
    cart,
    orderCtx: { categoryIds },
  };

  // Backend trả về conditions là object gốc: { id: "root", operator: "AND", conditions: [...] }
  // Ta gọi hàm đệ quy evaluateNode với object này
  return evaluateNode(coupon.conditions, ctx);
};
