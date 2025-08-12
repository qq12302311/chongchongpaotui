'use strict';

exports.main = async (event, context) => {
  const { phone_number } = event;

  console.log('发送短信云函数被调用，手机号:', phone_number);

  // 参数验证
  if (!phone_number) {
    return {
      code: 400,
      message: '手机号码不能为空'
    };
  }

  // 手机号格式验证
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone_number)) {
    return {
      code: 400,
      message: '手机号码格式不正确'
    };
  }

  try {
    // 初始化数据库连接
    const db = uniCloud.database();
    const collection = db.collection('verification_codes');

    // 检查发送频率限制（同一手机号1分钟内只能发送1次）
    try {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

      const recentSms = await collection
        .where({
          phone_number,
          created_at: db.command.gte(oneMinuteAgo)
        })
        .count();

      if (recentSms.total > 0) {
        return {
          code: 429,
          message: '发送过于频繁，请1分钟后再试'
        };
      }
    } catch (dbError) {
      console.log('数据库查询失败，可能是集合不存在，继续执行发送流程:', dbError.message);
      // 如果数据库查询失败（比如集合不存在），继续执行发送流程
    }

    // 生成6位随机验证码
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('生成的验证码:', verificationCode);

    // 调用阿里云短信API
    const response = await uniCloud.httpclient.request('https://dfsns.market.alicloudapi.com/data/send_sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Authorization': 'APPCODE a3f4f2a8a606468c97b56e845a5dbe21'
      },
      data: `content=code%3A${verificationCode}&template_id=CST_fhpthfyzqhvx11433&phone_number=${phone_number}`,
      dataType: 'json'
    });

    console.log('短信API响应:', response);

    if (response.data && response.data.status === 'OK') {
      // 将验证码存储到云数据库
      try {
        await collection.add({
          phone_number,
          code: verificationCode,
          created_at: new Date(),
          expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5分钟过期
          used: false,
          request_id: response.data.request_id
        });
        console.log('验证码已存储到数据库');
      } catch (dbError) {
        console.error('存储验证码到数据库失败:', dbError);
        // 即使数据库存储失败，也返回成功，因为短信已经发送
        // 这样可以保证用户体验，验证时可以回退到本地验证
      }

      return {
        code: 200,
        message: '验证码发送成功',
        data: {
          request_id: response.data.request_id,
          // 注意：生产环境不应该返回验证码，这里仅用于调试
          verification_code: verificationCode
        }
      };
    } else {
      console.error('短信发送失败:', response.data);
      return {
        code: 500,
        message: response.data?.reason || '短信发送失败',
        data: response.data
      };
    }
  } catch (error) {
    console.error('发送短信异常:', error);
    return {
      code: 500,
      message: '网络错误，请重试',
      error: error.message
    };
  }
};
