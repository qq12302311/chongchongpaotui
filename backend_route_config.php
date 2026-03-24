<?php

/**
 * 路由配置说明
 *
 * 请将以下路由添加到你的后端路由文件中
 * 路径：app/Http/routes/api.php 或 routes/api.php
 */

// 财务统计路由
Route::post('/financial/statistics', [FinancialStatisticsController::class, 'getStatistics']);

/**
 * 完整的路由配置示例（如果你使用路由分组）
 */

Route::prefix('financial')->group(function () {
    // 获取财务统计
    Route::post('/statistics', [FinancialStatisticsController::class, 'getStatistics']);

    // 可选：带日期筛选的统计
    Route::post('/statistics/filter', [FinancialStatisticsController::class, 'getStatisticsWithDateFilter']);
});

/**
 * 如果需要添加权限验证中间件
 */

Route::middleware(['auth:sanctum', 'admin'])->prefix('financial')->group(function () {
    Route::post('/statistics', [FinancialStatisticsController::class, 'getStatistics']);
});
