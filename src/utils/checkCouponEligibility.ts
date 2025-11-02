// utils/checkCouponEligibility.ts
// ===================================================================
// FIXED: Hỗ trợ CouponCondition mới { and | or } + clause field/operator/value
// + Tương thích ngược cho fieldId/IN/EQUALS, lý do rớt rõ ràng.
// ===================================================================

import type {
  Coupon,
  CouponCondition,
  CouponConditionClause,
} from "@/types/coupon";

// --- Kiểu dữ liệu tối thiểu cần để evaluate ---
type CartItem = { categoryIds?: string[] };
export type CartData = { items: CartItem[]; subtotal: number; total?: number };
export type UserData = { isNew?: boolean; age?: number | null };

export type EligibilityStatus =
  | { isEligible: true; reason: null }
  | { isEligible: false; reason: string };

// ===================== Utils =====================

const isGroup = (n: unknown): n is { and?: unknown[]; or?: unknown[] } =>
  !!n && typeof n === "object" && ("and" in (n as any) || "or" in (n as any));

const isClause = (n: unknown): n is CouponConditionClause =>
  !!n &&
  typeof n === "object" &&
  "field" in (n as any) &&
  "operator" in (n as any);

// Chuẩn hóa các mảnh "cũ" (fieldId, IN, EQUALS, …) về clause mới
function normalizeClause(node: any): CouponConditionClause | null {
  if (!node || typeof node !== "object") return null;

  // Nếu đã đúng clause mới
  if ("field" in node && "operator" in node) {
    return {
      field: String(node.field),
      operator: normalizeOperator(node.operator),
      value: node.value,
    };
  }

  // Back-compat: fieldId + operator (IN/EQUALS/…)
  if ("fieldId" in node && "operator" in node) {
    const fieldId = String(node.fieldId);
    const field = mapLegacyField(fieldId);
    return {
      field,
      operator: normalizeOperator(node.operator),
      value: node.value,
    };
  }

  return null;
}

function mapLegacyField(fieldId: string): string {
  switch (fieldId) {
    case "category_id":
      return "order.categoryIds"; // tập categoryIds trong giỏ
    case "customer_is_new":
      return "user.isNew";
    case "customer_age":
      return "user.age";
    default:
      // Cho phép backend gửi bất kỳ path nào khác => user.xxx, order.xxx
      return fieldId;
  }
}

function normalizeOperator(op: unknown) {
  const s = String(op).toLowerCase();
  if (s === "equals") return "equals";
  if (s === "=") return "=";
  if (s === "in") return "in";
  if (s === "nin") return "nin";
  if (s === "contains") return "contains";
  if (s === "regex") return "regex";
  if (s === "exists") return "exists";
  if (s === ">" || s === ">=" || s === "<" || s === "<=" || s === "!=")
    return s as CouponConditionClause["operator"];
  // Legacy upper
  if (s === "equals".toLowerCase() || s === "equal") return "equals";
  if (s === "in") return "in";
  if (s === "not_in" || s === "nin") return "nin";
  // fallback: dùng equals
  return "equals" as const;
}

function getByPath(root: any, path: string): any {
  return path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), root);
}

function compare(
  left: any,
  operator: CouponConditionClause["operator"],
  rawRight: unknown
): boolean {
  const right = rawRight as any;

  switch (operator) {
    case "=":
    case "equals":
      return left === right;
    case "!=":
      return left !== right;
    case ">":
    case ">=":
    case "<":
    case "<=": {
      const castNum = (v: any) => {
        if (v instanceof Date) return v.getTime();
        const n = Number(v);
        if (!Number.isNaN(n)) return n;
        const t = Date.parse(v);
        return Number.isNaN(t) ? NaN : t;
      };
      const a = castNum(left);
      const b = castNum(right);
      if (Number.isNaN(a) || Number.isNaN(b)) return false;
      if (operator === ">") return a > b;
      if (operator === ">=") return a >= b;
      if (operator === "<") return a < b;
      return a <= b;
    }
    case "in": {
      // left array: giao nhau
      if (Array.isArray(left)) {
        const setR = new Set(Array.isArray(right) ? right : [right]);
        return left.some((x) => setR.has(x));
      }
      // left scalar: thuộc tập
      const arr = Array.isArray(right) ? right : [right];
      return arr.includes(left);
    }
    case "nin": {
      if (Array.isArray(left)) {
        const setR = new Set(Array.isArray(right) ? right : [right]);
        return !left.some((x) => setR.has(x));
      }
      const arr = Array.isArray(right) ? right : [right];
      return !arr.includes(left);
    }
    case "contains": {
      if (Array.isArray(left)) {
        const arr = Array.isArray(right) ? right : [right];
        return arr.every((v) => left.includes(v));
      }
      if (typeof left === "string" && typeof right === "string") {
        return left.includes(right);
      }
      return false;
    }
    case "regex": {
      if (typeof left !== "string") return false;
      if (typeof right !== "string") return false;
      let pattern = right;
      let flags = "";
      const m = /^\/(.+)\/([a-z]*)$/.exec(right);
      if (m) {
        pattern = m[1];
        flags = m[2];
      }
      try {
        return new RegExp(pattern, flags).test(left);
      } catch {
        return false;
      }
    }
    case "exists": {
      const exists = left !== undefined && left !== null;
      return !!right === exists;
    }
  }
}

// ===================== Evaluate =====================

function evaluateClause(
  clause: CouponConditionClause,
  ctx: {
    cart: CartData;
    user: UserData;
    order: {
      subtotal: number;
      total: number;
      itemsCount: number;
      categoryIds: string[];
    };
  }
): EligibilityStatus {
  const { field, operator, value } = clause;

  // Map nhanh các field hay dùng
  let left: any;
  switch (field) {
    case "order.categoryIds":
      left = ctx.order.categoryIds;
      break;
    case "order.itemsCount":
      left = ctx.order.itemsCount;
      break;
    case "order.total":
      left = ctx.order.total;
      break;
    case "order.subtotal":
      left = ctx.order.subtotal;
      break;
    case "user.isNew":
      left = ctx.user.isNew;
      break;
    case "user.age":
      left = ctx.user.age;
      break;
    default:
      left = getByPath(
        { user: ctx.user, cart: ctx.cart, order: ctx.order },
        field
      );
  }

  const ok = compare(left, operator, value);
  if (ok) return { isEligible: true, reason: null };

  // Lý do “đẹp” cho vài case phổ biến
  if (
    field === "order.categoryIds" &&
    (operator === "in" || operator === "contains")
  ) {
    return {
      isEligible: false,
      reason: "Cần có sản phẩm thuộc danh mục yêu cầu (vd: Pizza)",
    };
  }
  if (field === "user.isNew" && (operator === "=" || operator === "equals")) {
    return {
      isEligible: false,
      reason: value
        ? "Chỉ dành cho khách hàng mới"
        : "Không áp dụng cho khách hàng mới",
    };
  }
  if (field === "user.age" && (operator === "=" || operator === "equals")) {
    return {
      isEligible: false,
      reason: `Chỉ dành cho khách hàng ${value} tuổi`,
    };
  }

  return {
    isEligible: false,
    reason: `Điều kiện không thỏa: ${field} ${operator} ${JSON.stringify(
      value
    )}`,
  };
}

function evaluateGroup(
  group: CouponCondition,
  ctx: {
    cart: CartData;
    user: UserData;
    order: {
      subtotal: number;
      total: number;
      itemsCount: number;
      categoryIds: string[];
    };
  }
): EligibilityStatus {
  if ("and" in group) {
    for (const raw of group.and) {
      const node = isGroup(raw) ? raw : normalizeClause(raw);
      if (!node)
        return { isEligible: false, reason: "Mệnh đề điều kiện không hợp lệ" };

      const res = isGroup(node)
        ? evaluateGroup(node, ctx)
        : evaluateClause(node, ctx);
      if (!res.isEligible) return res;
    }
    return { isEligible: true, reason: null };
  }

  if ("or" in group) {
    let anyPass = false;
    let firstReason: string | null = null;
    for (const raw of group.or) {
      const node = isGroup(raw) ? raw : normalizeClause(raw);
      if (!node) {
        firstReason ??= "Mệnh đề điều kiện không hợp lệ";
        continue;
      }
      const res = isGroup(node)
        ? evaluateGroup(node, ctx)
        : evaluateClause(node, ctx);
      if (res.isEligible) {
        anyPass = true;
        break;
      }
      if (!firstReason) firstReason = res.reason;
    }
    return anyPass
      ? { isEligible: true, reason: null }
      : { isEligible: false, reason: firstReason ?? "Không thỏa điều kiện" };
  }

  return { isEligible: false, reason: "Cấu trúc điều kiện không hợp lệ" };
}

// ===================== Public API =====================

export const checkCouponEligibility = (
  coupon: Coupon,
  cart: CartData,
  user: UserData
): EligibilityStatus => {
  console.log("hahhhaha");
  // 1) Đủ tối thiểu đơn hàng?
  if (coupon.minOrderAmount && cart.subtotal < coupon.minOrderAmount) {
    return {
      isEligible: false,
      reason: `Cần mua thêm ${(
        coupon.minOrderAmount - cart.subtotal
      ).toLocaleString("vi-VN")}đ`,
    };
  }

  // 2) Chuẩn bị ngữ cảnh order
  const categoryIds = Array.from(
    new Set(cart.items.flatMap((it) => it.categoryIds ?? []))
  );
  const orderCtx = {
    subtotal: cart.subtotal,
    total: cart.total ?? cart.subtotal,
    itemsCount: cart.items.length,
    categoryIds,
  };

  // 3) Không có conditions => pass
  if (!coupon.conditions) return { isEligible: true, reason: null };

  // 4) Nếu lỡ backend trả kiểu mảng => coi như AND
  if (Array.isArray(coupon.conditions)) {
    const group: CouponCondition = { and: coupon.conditions as any };
    return evaluateGroup(group, { cart, user, order: orderCtx });
  }

  // 5) Đúng cấu trúc { and | or }
  return evaluateGroup(coupon.conditions, { cart, user, order: orderCtx });
};
