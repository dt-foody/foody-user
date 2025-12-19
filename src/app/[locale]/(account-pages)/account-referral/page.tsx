"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Users,
  Loader,
  Copy,
  Check,
  Gift,
  Share2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/user.service"; // Giả sử bạn lưu code API ở đây
import { ReferralUser } from "@/types";
import ButtonPrimary from "@/shared/ButtonPrimary";

const AccountReferral = () => {
  const { fetchUser } = useAuthStore();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // States cho danh sách referral và phân trang
  const [listReferral, setListReferral] = useState<ReferralUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Khởi tạo dữ liệu
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        await fetchUser();
        const state = useAuthStore.getState();
        if (state.user?.referralCode) {
          setReferralCode(state.user.referralCode);
        }
        await fetchReferralList(1);
      } catch (error) {
        toast.error("Không thể tải thông tin giới thiệu");
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [fetchUser]);

  // Hàm fetch danh sách từ API mới
  const fetchReferralList = async (pageNum: number) => {
    try {
      const res = await userService.getReferralUsers({
        page: pageNum,
        limit: 10,
      });

      if (pageNum === 1) {
        setListReferral(res.results);
      } else {
        setListReferral((prev) => [...prev, ...res.results]);
      }

      setTotalResults(res.totalResults);
      setHasNextPage(pageNum < res.totalPages);
    } catch (error) {
      console.error("Error fetching referrals:", error);
    }
  };

  const handleLoadMore = async () => {
    if (isFetchingMore || !hasNextPage) return;
    setIsFetchingMore(true);
    const nextPage = page + 1;
    await fetchReferralList(nextPage);
    setPage(nextPage);
    setIsFetchingMore(false);
  };

  const handleCopy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setIsCopied(true);
      toast.success("Đã sao chép mã giới thiệu!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-72 gap-3">
        <Loader className="w-10 h-10 animate-spin text-orange-500" />
        <p className="text-sm text-gray-500 animate-pulse">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#3b2f26] flex items-center gap-2">
          <Gift className="text-orange-500" size={28} />
          Mã giới thiệu
        </h1>
        <p className="text-sm text-gray-500">
          Mời bạn bè tham gia để cùng nhận những ưu đãi hấp dẫn từ hệ thống.
        </p>
      </div>

      {/* REFERRAL CODE SECTION */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-[#FFFAF2] to-[#FFF5E6] p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-800">
              Mã giới thiệu của bạn
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              Chia sẻ mã này. Bạn và bạn bè sẽ nhận được quà tặng khi họ hoàn
              thành đơn hàng đầu tiên.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 min-w-[200px] rounded-xl border-2 border-dashed border-orange-200 bg-white px-6 py-4 flex items-center justify-center font-mono text-2xl font-black tracking-[0.2em] text-orange-600 shadow-inner">
              {referralCode || "-------"}
            </div>

            <button
              onClick={handleCopy}
              className={`flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold transition-all active:scale-95 shadow-md ${
                isCopied
                  ? "bg-green-500 text-white"
                  : "bg-primary-500 hover:bg-orange-600 text-white"
              }`}
            >
              {isCopied ? <Check size={20} /> : <Copy size={20} />}
              {isCopied ? "Đã chép" : "Sao chép"}
            </button>
          </div>
        </div>
        <Share2 className="absolute -bottom-4 -right-4 text-orange-100 w-32 h-32 rotate-12 z-0 opacity-50" />
      </div>

      {/* REFERRAL LIST SECTION */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Users size={20} className="text-gray-500" />
            Bạn bè đã giới thiệu
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
            {totalResults} thành viên
          </span>
        </div>

        <div className="p-6">
          {listReferral.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-200">
                <Users className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-gray-800">
                  Chưa có người được giới thiệu
                </p>
                <p className="text-sm text-gray-400">
                  Đừng lo, hãy bắt đầu chia sẻ mã để nhận ưu đãi!
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listReferral.map((referral) => (
                  <div
                    key={referral._id}
                    className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-orange-200 hover:shadow-md group"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-orange-100 to-orange-50 font-bold text-orange-700 ring-4 ring-white shadow-sm group-hover:from-orange-500 group-hover:to-orange-400 group-hover:text-white transition-all">
                      {referral.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate group-hover:text-orange-600 transition-colors">
                        {referral.name}
                      </p>
                      <div className="flex flex-col text-xs text-gray-500 mt-0.5">
                        <span className="truncate">{referral.email}</span>
                        {referral.phone && (
                          <span className="mt-0.5">{referral.phone}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">
                      Thành công
                    </div>
                  </div>
                ))}
              </div>

              {/* Nút Xem thêm */}
              {hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <ButtonPrimary
                    onClick={handleLoadMore}
                    disabled={isFetchingMore}
                    className="px-8"
                  >
                    {isFetchingMore ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : null}
                    Xem thêm thành viên
                  </ButtonPrimary>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountReferral;
