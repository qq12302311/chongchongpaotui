'use strict';

/**
 * 查询订单价格明细云函数
 * 
 * 功能说明：
 * 1. 根据订单ID查询价格明细
 * 2. 支持用户查看自己订单的价格明细
 * 3. 支持管理员查看所有订单的价格明细
 * 4. 提供格式化的价格明细展示
 */

exports.main = async (event, context) => {
  console.log('查询价格明细云函数被调用');
  console.log('接收参数:', JSON.stringify(event, null, 2));

  const {
    task_id,        // 订单ID（必填）
    user_id,        // 用户ID（用于权限验证）
    is_admin        // 是否管理员
  } = event;

  // 参数验证
  if (!task_id) {
    return {
      code: 400,
      message: '订单ID不能为空'
    };
  }

  try {
    const db = uniCloud.database();
    const priceDetailsCollection = db.collection('price_details');

    // 构建查询条件
    const whereCondition = { task_id };
    
    // 如果不是管理员，只能查询自己的订单
    if (!is_admin && user_id) {
      whereCondition.user_id = user_id;
    }

    console.log('查询条件:', whereCondition);

    // 查询价格明细
    const result = await priceDetailsCollection
      .where(whereCondition)
      .orderBy('created_at', 'desc')
      .limit(1)
      .get();

    if (result.data.length === 0) {
      return {
        code: 404,
        message: '未找到该订单的价格明细'
      };
    }

    const priceDetail = result.data[0];

    // 格式化价格明细，便于前端展示
    const formattedDetail = formatPriceDetail(priceDetail);

    console.log('查询成功，返回价格明细');

    return {
      code: 200,
      message: '查询成功',
      data: {
        raw_data: priceDetail,           // 原始数据
        formatted_data: formattedDetail   // 格式化数据
      }
    };

  } catch (error) {
    console.error('查询价格明细失败:', error);
    return {
      code: 500,
      message: '查询价格明细失败',
      error: error.message
    };
  }
};

/**
 * 格式化价格明细，便于前端展示
 */
function formatPriceDetail(detail) {
  const items = [];

  // 1. 基础服务费明细
  if (detail.base_service_fee_detail) {
    const baseDetail = detail.base_service_fee_detail;
    
    items.push({
      category: '基础服务费',
      items: [
        {
          name: '基础设备费用',
          description: `${baseDetail.base_device_count || 0}台设备基础费用`,
          amount: baseDetail.base_device_fee || 0
        }
      ]
    });

    if (baseDetail.extra_device_fee > 0) {
      items[0].items.push({
        name: '额外设备费用',
        description: `${baseDetail.extra_device_count || 0}台额外设备 × ¥${baseDetail.extra_device_unit_fee || 0}/台`,
        amount: baseDetail.extra_device_fee || 0
      });
    }

    items[0].subtotal = baseDetail.total || 0;
  }

  // 2. 距离费明细
  if (detail.distance_fee_detail) {
    const distDetail = detail.distance_fee_detail;
    
    const distanceItems = [{
      name: '基础距离费用',
      description: `${distDetail.base_distance || 0}公里内`,
      amount: distDetail.base_distance_fee || 0
    }];

    if (distDetail.extra_distance_fee > 0) {
      const extraDistanceCount = Math.ceil(distDetail.extra_distance / distDetail.extra_distance_unit);
      distanceItems.push({
        name: '超出距离费用',
        description: `超出${distDetail.extra_distance.toFixed(2)}公里，按每${distDetail.extra_distance_unit}公里¥${distDetail.extra_distance_unit_fee}计费，共${extraDistanceCount}个计费单位`,
        amount: distDetail.extra_distance_fee || 0
      });
    }

    items.push({
      category: '距离费',
      description: `实际距离：${distDetail.actual_distance?.toFixed(2) || 0}公里`,
      items: distanceItems,
      subtotal: distDetail.total || 0
    });
  }

  // 3. 时效费明细
  if (detail.time_limit_fee_detail && detail.time_limit_fee_detail.time_limit_fee > 0) {
    const timeDetail = detail.time_limit_fee_detail;
    
    items.push({
      category: '时效费',
      items: [{
        name: '时间限制费用',
        description: timeDetail.calculation_rule || '',
        amount: timeDetail.time_limit_fee || 0
      }],
      subtotal: timeDetail.time_limit_fee || 0
    });
  }

  // 4. 附加服务费明细
  if (detail.additional_services && detail.additional_services.length > 0) {
    const additionalItems = [];
    
    detail.additional_services.forEach(service => {
      const serviceItems = [{
        name: `${service.service_name} - 基础费用`,
        description: `${service.base_count}个基础额度`,
        amount: service.base_fee || 0
      }];

      if (service.extra_fee > 0) {
        serviceItems.push({
          name: `${service.service_name} - 额外费用`,
          description: `${service.extra_count}个额外 × ¥${service.extra_unit_fee}/个`,
          amount: service.extra_fee || 0
        });
      }

      additionalItems.push(...serviceItems);
    });

    const totalAdditional = detail.additional_services.reduce((sum, s) => sum + (s.total || 0), 0);

    items.push({
      category: '附加服务费',
      items: additionalItems,
      subtotal: totalAdditional
    });
  }

  // 5. 骑手打赏
  if (detail.rider_tip > 0) {
    items.push({
      category: '骑手打赏',
      items: [{
        name: '打赏金额',
        description: '感谢骑手的优质服务',
        amount: detail.rider_tip || 0
      }],
      subtotal: detail.rider_tip || 0
    });
  }

  // 6. 优惠券抵扣
  if (detail.discount_detail && detail.discount_detail.coupon_amount > 0) {
    items.push({
      category: '优惠抵扣',
      items: [{
        name: detail.discount_detail.coupon_name || '优惠券',
        description: detail.discount_detail.coupon_id ? `券号：${detail.discount_detail.coupon_id}` : '',
        amount: -detail.discount_detail.coupon_amount || 0
      }],
      subtotal: -detail.discount_detail.coupon_amount || 0
    });
  }

  // 汇总信息
  const summary = {
    service_amount: detail.price_summary?.service_amount || 0,
    discount_amount: detail.price_summary?.discount_amount || 0,
    total_amount: detail.price_summary?.total_amount || 0,
    rider_tip_amount: detail.price_summary?.rider_tip_amount || 0,
    payment_amount: detail.price_summary?.payment_amount || 0,
    is_high_price: detail.is_high_price || false
  };

  return {
    task_id: detail.task_id,
    created_at: detail.created_at,
    base_info: detail.base_info,
    detail_items: items,
    summary: summary,
    calculation_note: detail.calculation_note || '',
    provider_config_snapshot: detail.provider_price_config
  };
}






