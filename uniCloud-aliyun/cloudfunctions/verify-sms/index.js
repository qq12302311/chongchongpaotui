'use strict';

exports.main = async (event, context) => {
  const { phone_number, verification_code } = event;

  console.log('验证短信云函数被调用，手机号:', phone_number, '验证码:', verification_code);

  // 参数验证
  if (!phone_number || !verification_code) {
    return {
      code: 400,
      message: '手机号码和验证码不能为空'
    };
  }

  // 验证码格式验证
  if (!/^\d{6}$/.test(verification_code)) {
    return {
      code: 400,
      message: '验证码格式不正确'
    };
  }

  try {
    const db = uniCloud.database();
    const collection = db.collection('verification_codes');

    // 查找未使用且未过期的验证码
    try {
      const result = await collection.where({
        phone_number,
        code: verification_code,
        used: false,
        expires_at: db.command.gt(new Date())
      }).get();

      console.log('查询验证码结果:', result);

      if (result.data.length === 0) {
        // 检查是否存在该手机号的验证码记录
        try {
          const allCodes = await collection.where({
            phone_number
          }).orderBy('created_at', 'desc').limit(1).get();

          if (allCodes.data.length === 0) {
            return {
              code: 400,
              message: '请先获取验证码'
            };
          }

          const latestCode = allCodes.data[0];
          if (latestCode.used) {
            return {
              code: 400,
              message: '验证码已使用'
            };
          }

          if (new Date() > new Date(latestCode.expires_at)) {
            return {
              code: 400,
              message: '验证码已过期'
            };
          }

          return {
            code: 400,
            message: '验证码错误'
          };
        } catch (queryError) {
          console.error('查询历史验证码失败:', queryError);
          return {
            code: 400,
            message: '验证码错误'
          };
        }
      }

      // 标记验证码为已使用
      try {
        await collection.doc(result.data[0]._id).update({
          used: true,
          used_at: new Date()
        });
        console.log('验证码已标记为已使用');
      } catch (updateError) {
        console.error('更新验证码状态失败:', updateError);
        // 即使更新失败，也返回验证成功，避免用户重复验证
      }

      console.log('验证码验证成功');

      return {
        code: 200,
        message: '验证码验证成功',
        data: {
          verified: true
        }
      };
    } catch (dbError) {
      console.error('数据库操作失败:', dbError);
      // 如果数据库操作失败，返回通用错误
      return {
        code: 500,
        message: '数据库连接失败，请稍后重试'
      };
    }
  } catch (error) {
    console.error('验证码验证异常:', error);
    return {
      code: 500,
      message: '验证失败，请重试',
      error: error.message
    };
  }
};
