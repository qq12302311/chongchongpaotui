// 高德地图API密钥
const AMAP_KEY = 'c34dee46481f77816b9980f7efd95a24';
import areaDataJson from '@/json/areaData.json'

// 获取所有省份列表
export function getAllProvinces() {
    return new Promise((resolve, reject) => {
        uni.request({
            url: 'https://restapi.amap.com/v3/config/district',
            data: {
                key: AMAP_KEY,
                keywords: '中国',
                subdistrict: 1,
                extensions: 'all',
                output: 'json'
            },
            success: (res) => {
                if (res.data.status === '1' && res.data.districts && res.data.districts[0]) {
                    const provinces = res.data.districts[0].districts.map(province => ({
                        name: province.name,
                        adcode: province.adcode,
                        center: province.center
                    }));
                    resolve(provinces);
                } else {
                    reject(new Error('获取省份数据失败'));
                }
            },
            fail: reject
        });
    });
}

// 获取指定省份的所有城市
export function getCitiesByProvince(provinceAdcode) {
    return new Promise((resolve, reject) => {
        uni.request({
            url: 'https://restapi.amap.com/v3/config/district',
            data: {
                key: AMAP_KEY,
                keywords: provinceAdcode,
                subdistrict: 1,
                extensions: 'all',
                output: 'json'
            },
            success: (res) => {
                if (res.data.status === '1' && res.data.districts && res.data.districts[0]) {
                    const cities = res.data.districts[0].districts.map(city => ({
                        name: city.name,
                        adcode: city.adcode,
                        center: city.center
                    }));
                    resolve(cities);
                } else {
                    reject(new Error('获取城市数据失败'));
                }
            },
            fail: reject
        });
    });
}

// 获取指定城市的所有区县
export function getDistrictsByCity(cityAdcode, retryCount = 3) {
    return new Promise((resolve, reject) => {
        const makeRequest = (retryLeft) => {
            uni.request({
                url: 'https://restapi.amap.com/v3/config/district',
                data: {
                    key: AMAP_KEY,
                    keywords: cityAdcode,
                    subdistrict: 1,
                    extensions: 'all',
                    output: 'json'
                },
                success: (res) => {
                    if (res.data.status === '1' && res.data.districts && res.data.districts[0]) {
                        const districts = res.data.districts[0].districts.map(district => ({
                            name: district.name,
                            adcode: district.adcode,
                            center: district.center
                        }));
                        resolve(districts);
                    } else {
                        const errorMsg = res.data.info || '获取区县数据失败';
                        console.error(`获取区县数据失败 (城市编码: ${cityAdcode}):`, errorMsg);
                        if (retryLeft > 0) {
                            console.log(`尝试重新获取数据，剩余重试次数: ${retryLeft - 1}`);
                            setTimeout(() => makeRequest(retryLeft - 1), 1000);
                        } else {
                            reject(new Error(errorMsg));
                        }
                    }
                },
                fail: (error) => {
                    console.error(`请求失败 (城市编码: ${cityAdcode}):`, error);
                    if (retryLeft > 0) {
                        console.log(`尝试重新获取数据，剩余重试次数: ${retryLeft - 1}`);
                        setTimeout(() => makeRequest(retryLeft - 1), 1000);
                    } else {
                        reject(error);
                    }
                }
            });
        };
        
        makeRequest(retryCount);
    });
}

// 获取完整的行政区划数据
export async function getAllAreaData() {
    try {
        // 显示加载提示
        uni.showLoading({
            title: '正在获取数据...',
            mask: true
        });

        // 获取所有省份
        const provinces = await getAllProvinces();
        const areaData = {};

        // 遍历每个省份
        for (const province of provinces) {
            console.log(`正在获取 ${province.name} 的城市数据...`);
            areaData[province.name] = {
                adcode: province.adcode,
                center: province.center,
                cities: {}
            };

            // 获取该省份的所有城市
            const cities = await getCitiesByProvince(province.adcode);

            // 遍历每个城市
            for (const city of cities) {
                console.log(`正在获取 ${city.name} 的区县数据...`);
                areaData[province.name].cities[city.name] = {
                    adcode: city.adcode,
                    center: city.center,
                    districts: {}
                };

                // 获取该城市的所有区县
                const districts = await getDistrictsByCity(city.adcode);

                // 保存区县数据
                for (const district of districts) {
                    areaData[province.name].cities[city.name].districts[district.name] = {
                        adcode: district.adcode,
                        center: district.center
                    };
                }

                // 添加延时避免请求过快
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // 添加延时避免请求过快
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // 隐藏加载提示
        uni.hideLoading();

        // 保存数据到本地存储
        uni.setStorageSync('areaData', JSON.stringify(areaData));

        // 保存数据到项目根目录
        const fs = uni.getFileSystemManager();
        const filePath = `${uni.env.USER_DATA_PATH}/areaData.json`;
        fs.writeFileSync(filePath, JSON.stringify(areaData, null, 2), 'utf8');

        // 复制文件到项目根目录
        const projectRootPath = `${uni.env.USER_DATA_PATH}/../../areaData.json`;
        try {
            fs.copyFileSync(filePath, projectRootPath);
            console.log('数据已保存到项目根目录');
        } catch (error) {
            console.error('复制文件到项目根目录失败:', error);
        }

        console.log('数据获取完成并已保存');
        return areaData;
    } catch (error) {
        // 隐藏加载提示
        uni.hideLoading();
        console.error('获取数据失败:', error);
        throw error;
    }
}

// 从本地存储或文件加载数据
export function loadAreaData() {
    try {
        // 先尝试从本地存储获取
        const storageData = uni.getStorageSync('areaData');
        if (storageData) {
            return JSON.parse(storageData);
        }

        // 如果本地存储没有，尝试从项目根目录读取
        // const fs = uni.getFileSystemManager();
        // const filePath = `${uni.env.USER_DATA_PATH}/areaData.json`;
        try {
            // const fileData = fs.readFileSync(filePath, 'utf8');
            // return JSON.parse(fileData);
			return areaDataJson;
        } catch (error) {
            console.error('读取数据失败:', error);
            return null;
        }
    } catch (error) {
        console.error('加载数据失败:', error);
        return null;
    }
}

// 根据经纬度获取地址信息
export function getAddressByLocation(longitude, latitude) {
    return new Promise((resolve, reject) => {
        uni.request({
            url: 'https://restapi.amap.com/v3/geocode/regeo',
            data: {
                key: AMAP_KEY,
                location: `${longitude},${latitude}`,
                extensions: 'all',
                output: 'json'
            },
            success: (res) => {
                if (res.data.status === '1' && res.data.regeocode) {
                    const addressComponent = res.data.regeocode.addressComponent;
                    resolve({
                        province: addressComponent.province,
                        city: addressComponent.city,
                        district: addressComponent.district,
                        formattedAddress: res.data.regeocode.formatted_address
                    });
                } else {
                    reject(new Error('获取地址信息失败'));
                }
            },
            fail: reject
        });
    });
}

// 将本地存储的 areaData 导出为 JSON 文件
export function exportAreaDataToFile() {
    try {
        // 从本地存储获取数据
        const storageData = uni.getStorageSync('areaData');
        if (!storageData) {
            throw new Error('本地存储中没有 areaData 数据');
        }

        // 解析数据
        const areaData = JSON.parse(storageData);

        // 使用微信小程序的文件系统 API
        const fs = uni.getFileSystemManager();
        const filePath = `${uni.env.USER_DATA_PATH}/areaData.json`;
        
        // 写入文件
        fs.writeFileSync(filePath, JSON.stringify(areaData, null, 2), 'utf8');
        
        // 保存成功后，将文件内容复制到剪贴板
        uni.setClipboardData({
            data: JSON.stringify(areaData, null, 2),
            success: () => {
                uni.showModal({
                    title: '导出成功',
                    content: '数据已复制到剪贴板，请手动保存到目标目录',
                    showCancel: false
                });
            }
        });
        
        console.log('数据已成功导出到文件:', filePath);
        return true;
    } catch (error) {
        console.error('导出数据失败:', error);
        uni.showToast({
            title: '导出失败',
            icon: 'none'
        });
        throw error;
    }
} 