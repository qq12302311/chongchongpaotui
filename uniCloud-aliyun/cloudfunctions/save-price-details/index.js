'use strict';

/**
 * 保存订单价格明细云函数
 * 
 * 功能说明：
 * 1. 接收订单的详细价格计算信息
 * 2. 将价格明细存储到 price_details 集合
 * 3. 记录每一项费用的计算依据和金额
 * 4. 方便后续价格争议查询和审计
 */

exports.main = async (event, context) => {
  console.log('保存价格明细云函数被调用');
  console.log('接收参数:', JSON.stringify(event, null, 2));

  const {
    task_id,              // 订单ID（必填）
    user_id,              // 用户ID（必填）
    service_provider_id,  // 服务商ID
    task_type_id,         // 任务类型ID
    base_info,            // 基础信息
    price_details,        // 价格明细对象
    provider_config       // 服务商价格配置快照
  } = event;

  // 参数验证
  if (!task_id || !user_id) {
    return {
      code: 400,
      message: '订单ID和用户ID不能为空'
    };
  }

  if (!price_details) {
    return {
      code: 400,
      message: '价格明细不能为空'
    };
  }

  try {
    const db = uniCloud.database();
    const priceDetailsCollection = db.collection('price_details');

    // 构建基础服务费明细
    const baseServiceFeeDetail = {
      base_device_fee: price_details.baseServiceFee || 0,
      base_device_count: base_info?.item_number || 0,
      extra_device_fee: price_details.extraDeviceFee || 0,
      extra_device_count: base_info?.item_number > (provider_config?.bubao_base_device || 0) 
        ? base_info.item_number - provider_config.bubao_base_device 
        : 0,
      extra_device_unit_fee: parseFloat(provider_config?.bubao_extra_device_fee || 0),
      // 如果有阶梯费用数据，也可以在这里记录
      tier_fees: [],
      total: (price_details.baseServiceFee || 0) + (price_details.extraDeviceFee || 0)
    };

    // 构建距离费明细
    const distanceFeeDetail = {
      base_distance: provider_config?.bubao_base_distance || 0,
      base_distance_fee: price_details.distanceFee || 0,
      actual_distance: base_info?.distance || 0,
      extra_distance: Math.max(0, (base_info?.distance || 0) - (provider_config?.bubao_base_distance || 0)),
      extra_distance_unit: provider_config?.bubao_extra_distance || 0,
      extra_distance_unit_fee: parseFloat(provider_config?.bubao_extra_distance_fee || 0),
      extra_distance_fee: price_details.extraDistanceFee || 0,
      total: (price_details.distanceFee || 0) + (price_details.extraDistanceFee || 0)
    };

    // 构建时效费明细
    const timeLimitFeeDetail = {
      time_type: base_info?.time_type || '',
      time_limit_hours: base_info?.time_limit || 0,
      time_limit_fee: price_details.timeLimitFee || 0,
      calculation_rule: base_info?.time_type === 'before_deadline' 
        ? `限时${base_info.time_limit}小时内完成` 
        : '时间范围内完成'
    };

    // 构建附加服务明细数组
    const additionalServices = [];

    // 电源线服务
    if (price_details.wireFee > 0 || price_details.extraWireFee > 0) {
      additionalServices.push({
        service_name: '电源线服务',
        service_code: 'powerCable',
        base_fee: price_details.wireFee || 0,
        base_count: provider_config?.bubao_wire_base_device || 0,
        actual_count: base_info?.cableQuantity || 0,
        extra_count: Math.max(0, (base_info?.cableQuantity || 0) - (provider_config?.bubao_wire_base_device || 0)),
        extra_unit_fee: parseFloat(provider_config?.bubao_wire_device_fee || 0),
        extra_fee: price_details.extraWireFee || 0,
        total: (price_details.wireFee || 0) + (price_details.extraWireFee || 0)
      });
    }

    // 通电服务
    if (price_details.powerFee > 0) {
      additionalServices.push({
        service_name: '通电服务',
        service_code: 'power',
        base_fee: parseFloat(provider_config?.bubao_power_fee || 0),
        base_count: provider_config?.bubao_power_base_device || 0,
        actual_count: base_info?.powerQuantity || 0,
        extra_count: Math.max(0, (base_info?.powerQuantity || 0) - (provider_config?.bubao_power_base_device || 0)),
        extra_unit_fee: parseFloat(provider_config?.bubao_power_device_fee || 0),
        extra_fee: price_details.powerFee - parseFloat(provider_config?.bubao_power_fee || 0),
        total: price_details.powerFee || 0
      });
    }

    // 处理异常服务
    if (price_details.exceptionFee > 0 || price_details.exceptionExtraFee > 0) {
      additionalServices.push({
        service_name: '处理异常',
        service_code: 'handleException',
        base_fee: price_details.exceptionFee || 0,
        base_count: provider_config?.bubao_exception_base_device || 1,
        actual_count: base_info?.exceptionQuantity || 0,
        extra_count: Math.max(0, (base_info?.exceptionQuantity || 0) - (provider_config?.bubao_exception_base_device || 1)),
        extra_unit_fee: parseFloat(provider_config?.bubao_exception_extra_device_fee || 0),
        extra_fee: price_details.exceptionExtraFee || 0,
        total: (price_details.exceptionFee || 0) + (price_details.exceptionExtraFee || 0)
      });
    }

    // 坏宝回收服务
    if (price_details.badItemRecycleFee > 0 || price_details.badItemRecycleExtraFee > 0) {
      additionalServices.push({
        service_name: '坏宝回收',
        service_code: 'badItemRecycle',
        base_fee: price_details.badItemRecycleFee || 0,
        base_count: provider_config?.bubao_shoubao_base_device || 1,
        actual_count: base_info?.badItemRecycleQuantity || 0,
        extra_count: Math.max(0, (base_info?.badItemRecycleQuantity || 0) - (provider_config?.bubao_shoubao_base_device || 1)),
        extra_unit_fee: parseFloat(provider_config?.bubao_shoubao_extra_device_fee || 0),
        extra_fee: price_details.badItemRecycleExtraFee || 0,
        total: (price_details.badItemRecycleFee || 0) + (price_details.badItemRecycleExtraFee || 0)
      });
    }

    // 加电源线服务
    if (price_details.addPowerCableFee > 0 || price_details.addPowerCableExtraFee > 0) {
      additionalServices.push({
        service_name: '加电源线',
        service_code: 'addPowerCable',
        base_fee: price_details.addPowerCableFee || 0,
        base_count: provider_config?.bubao_wire_base_device || 1,
        actual_count: base_info?.powerCableQuantity || 0,
        extra_count: Math.max(0, (base_info?.powerCableQuantity || 0) - (provider_config?.bubao_wire_base_device || 1)),
        extra_unit_fee: parseFloat(provider_config?.bubao_wire_extra_device_fee || 0),
        extra_fee: price_details.addPowerCableExtraFee || 0,
        total: (price_details.addPowerCableFee || 0) + (price_details.addPowerCableExtraFee || 0)
      });
    }

    // 构建优惠明细
    const discountDetail = {
      coupon_id: base_info?.coupon_id || '',
      coupon_name: base_info?.coupon_name || '',
      coupon_amount: price_details.couponAmount || 0,
      coupon_type: base_info?.coupon_type || ''
    };

    // 计算价格汇总
    const serviceAmount = price_details.serviceAmount || 0;
    const couponAmount = price_details.couponAmount || 0;
    const riderTip = price_details.riderTip || 0;
    const totalAmount = price_details.total || 0;
    const paymentAmount = totalAmount + riderTip;

    const priceSummary = {
      service_amount: serviceAmount,
      discount_amount: couponAmount,
      total_amount: totalAmount,
      rider_tip_amount: riderTip,
      payment_amount: paymentAmount
    };

    // 判断是否为高价订单（这里设置阈值为100元，可根据实际情况调整）
    const highPriceThreshold = 100;
    const isHighPrice = paymentAmount >= highPriceThreshold;

    // 生成计费说明
    let calculationNote = `订单共${base_info?.item_number || 0}台设备，`;
    calculationNote += `距离${(base_info?.distance || 0).toFixed(2)}公里。`;
    if (base_info?.time_type === 'before_deadline') {
      calculationNote += `限时${base_info.time_limit}小时内完成。`;
    }
    if (additionalServices.length > 0) {
      calculationNote += `附加服务：${additionalServices.map(s => s.service_name).join('、')}。`;
    }

    // 构建完整的价格明细记录
    const priceDetailRecord = {
      task_id,
      user_id,
      service_provider_id: service_provider_id || '',
      task_type_id: task_type_id || '',
      created_at: new Date(),
      base_info: {
        item_number: base_info?.item_number || 0,
        distance: base_info?.distance || 0,
        time_type: base_info?.time_type || '',
        time_limit: base_info?.time_limit || 0
      },
      base_service_fee_detail: baseServiceFeeDetail,
      distance_fee_detail: distanceFeeDetail,
      time_limit_fee_detail: timeLimitFeeDetail,
      additional_services: additionalServices,
      discount_detail: discountDetail,
      rider_tip: riderTip,
      price_summary: priceSummary,
      provider_price_config: provider_config || {},
      calculation_note: calculationNote,
      is_high_price: isHighPrice,
      high_price_threshold: highPriceThreshold
    };

    console.log('准备保存的价格明细记录:', JSON.stringify(priceDetailRecord, null, 2));

    // 保存到数据库
    const saveResult = await priceDetailsCollection.add(priceDetailRecord);

    console.log('价格明细保存成功，记录ID:', saveResult.id);

    return {
      code: 200,
      message: '价格明细保存成功',
      data: {
        detail_id: saveResult.id,
        is_high_price: isHighPrice,
        payment_amount: paymentAmount
      }
    };

  } catch (error) {
    console.error('保存价格明细失败:', error);
    return {
      code: 500,
      message: '保存价格明细失败',
      error: error.message
    };
  }
};






