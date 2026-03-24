<?php

/**
 * 财务统计API接口
 * 路径：/api/financial/statistics
 * 方法：POST
 *
 * 功能：返回平台整体财务统计数据
 */

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinancialStatisticsController extends Controller
{
    /**
     * 获取财务统计数据
     */
    public function getStatistics(Request $request)
    {
        try {
            // 验证权限（确保是管理员）
            // $this->authorize('view-financial-statistics');

            // 1. 查询平台总收入（所有已支付订单的实际金额）
            $incomeData = DB::table('tasks')
                ->select(
                    DB::raw('SUM(actual_amount) as total_income'),
                    DB::raw('COUNT(*) as order_count')
                )
                ->where('payment_status', 'paid')
                ->whereNull('deleted_at')
                ->first();

            // 2. 查询骑手数据（累计佣金、可提余额）
            $riderData = DB::table('service_members')
                ->select(
                    DB::raw('SUM(total_commission) as total_commission'),
                    DB::raw('SUM(balance) as available_balance'),
                    DB::raw('COUNT(*) as rider_count'),
                    DB::raw('SUM(CASE WHEN task_quota > 0 THEN 1 ELSE 0 END) as active_count')
                )
                ->whereNull('deleted_at')
                ->first();

            // 3. 查询各状态的提现数据
            $withdrawalData = DB::table('withdrawals')
                ->select(
                    'status',
                    DB::raw('SUM(actual_amount) as total_amount'),
                    DB::raw('COUNT(*) as count')
                )
                ->whereNull('deleted_at')
                ->groupBy('status')
                ->get()
                ->keyBy('status');

            // 4. 整理数据
            $totalIncome = floatval($incomeData->total_income ?? 0);
            $totalExpense = floatval($riderData->total_commission ?? 0);
            $profit = $totalIncome - $totalExpense;
            $profitRate = $totalIncome > 0 ? ($profit / $totalIncome) * 100 : 0;

            $completedWithdrawal = $withdrawalData->get('completed');
            $processingWithdrawal = $withdrawalData->get('processing');
            $pendingWithdrawal = $withdrawalData->get('pending');

            // 5. 返回统计数据
            return response()->json([
                'code' => 200,
                'status' => 'success',
                'message' => '获取财务统计成功',
                'data' => [
                    // 财务数据
                    'financial' => [
                        'total_income' => number_format($totalIncome, 2, '.', ''),
                        'total_expense' => number_format($totalExpense, 2, '.', ''),
                        'profit' => number_format($profit, 2, '.', ''),
                        'profit_rate' => number_format($profitRate, 2, '.', ''),
                        'order_count' => intval($incomeData->order_count ?? 0)
                    ],

                    // 提现数据
                    'withdrawal' => [
                        'completed_amount' => number_format(floatval($completedWithdrawal->total_amount ?? 0), 2, '.', ''),
                        'completed_count' => intval($completedWithdrawal->count ?? 0),
                        'processing_amount' => number_format(floatval($processingWithdrawal->total_amount ?? 0), 2, '.', ''),
                        'processing_count' => intval($processingWithdrawal->count ?? 0),
                        'pending_amount' => number_format(floatval($pendingWithdrawal->total_amount ?? 0), 2, '.', ''),
                        'pending_count' => intval($pendingWithdrawal->count ?? 0),
                        'available_balance' => number_format(floatval($riderData->available_balance ?? 0), 2, '.', ''),
                        'rider_count' => intval($riderData->rider_count ?? 0)
                    ],

                    // 骑手数据
                    'rider' => [
                        'total_count' => intval($riderData->rider_count ?? 0),
                        'active_count' => intval($riderData->active_count ?? 0),
                        'total_commission' => number_format($totalExpense, 2, '.', ''),
                        'avg_commission' => $riderData->rider_count > 0
                            ? number_format($totalExpense / $riderData->rider_count, 2, '.', '')
                            : '0.00'
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'status' => 'error',
                'message' => '获取财务统计失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 获取带日期筛选的财务统计（可选功能）
     */
    public function getStatisticsWithDateFilter(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // 添加日期筛选逻辑
        // ...
    }
}
