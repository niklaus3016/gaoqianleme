// 百度联盟广告服务
import { registerPlugin } from '@capacitor/core';

// 百度联盟广告插件类型定义
interface BaiduAdPlugin {
  init(options: {
    appId: string;
    debug: boolean;
  }): Promise<{
    success: boolean;
    version?: string;
  }>;
  
  loadRewardedAd(options: {
    adUnitId: string;
  }): Promise<{
    success: boolean;
    error?: string;
  }>;
  
  showRewardedAd(options: {}): Promise<{
    rewarded: boolean;
    amount?: number;
    name?: string;
    error?: string;
  }>;
  
  isAdLoaded(options: {}): Promise<{
    isLoaded: boolean;
  }>;
}

// 注册百度联盟广告插件
const BaiduAd = registerPlugin<BaiduAdPlugin>('BaiduAd');

// 广告位ID
const AD_UNIT_ID = '19100351';
// 应用ID
const APP_ID = 'ccffe2fd';

// 广告状态
export interface AdStatus {
  isLoaded: boolean;
  isShowing: boolean;
  error: string | null;
}

// 广告回调函数类型
type AdLoadCallback = (success: boolean, error?: string) => void;
type AdShowCallback = (success: boolean, error?: string) => void;
type AdRewardCallback = (rewarded: boolean, amount?: number) => void;

// 广告服务类
class AdService {
  private adStatus: AdStatus = {
    isLoaded: false,
    isShowing: false,
    error: null
  };
  
  private loadCallback: AdLoadCallback | null = null;
  private showCallback: AdShowCallback | null = null;
  private rewardCallback: AdRewardCallback | null = null;
  private isInitialized: boolean = false;

  // 初始化广告SDK
  async init(): Promise<void> {
    try {
      if (BaiduAd) {
        const result = await BaiduAd.init({
          appId: APP_ID,
          debug: true
        });
        this.isInitialized = result.success;
        console.log('百度联盟广告SDK初始化成功:', result);
      } else {
        console.error('百度联盟广告插件未找到');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('百度联盟广告SDK初始化失败:', error);
      this.isInitialized = false;
    }
  }

  // 加载激励视频广告
  async loadRewardedAd(callback: AdLoadCallback): Promise<void> {
    this.loadCallback = callback;
    
    try {
      if (!BaiduAd) {
        if (this.loadCallback) {
          this.loadCallback(false, '广告插件未找到');
          this.loadCallback = null;
        }
        return;
      }

      if (!this.isInitialized) {
        await this.init();
      }

      const result = await BaiduAd.loadRewardedAd({
        adUnitId: AD_UNIT_ID
      });

      this.adStatus.isLoaded = result.success;
      this.adStatus.error = result.success ? null : result.error;

      if (this.loadCallback) {
        this.loadCallback(result.success, result.error);
        this.loadCallback = null;
      }
    } catch (error) {
      console.error('广告加载失败:', error);
      this.adStatus.isLoaded = false;
      this.adStatus.error = error.message;
      
      if (this.loadCallback) {
        this.loadCallback(false, error.message);
        this.loadCallback = null;
      }
    }
  }

  // 显示激励视频广告
  async showRewardedAd(callback: AdShowCallback, rewardCallback: AdRewardCallback): Promise<void> {
    this.showCallback = callback;
    this.rewardCallback = rewardCallback;
    
    if (!this.adStatus.isLoaded) {
      if (this.showCallback) {
        this.showCallback(false, '广告未加载');
        this.showCallback = null;
      }
      return;
    }

    try {
      if (!BaiduAd) {
        if (this.showCallback) {
          this.showCallback(false, '广告插件未找到');
          this.showCallback = null;
        }
        return;
      }

      this.adStatus.isShowing = true;
      
      const result = await BaiduAd.showRewardedAd({});
      
      this.adStatus.isShowing = false;
      this.adStatus.isLoaded = false;
      
      if (this.showCallback) {
        this.showCallback(true);
        this.showCallback = null;
      }
      
      if (this.rewardCallback) {
        this.rewardCallback(result.rewarded, result.amount);
        this.rewardCallback = null;
      }
    } catch (error) {
      console.error('广告显示失败:', error);
      this.adStatus.isShowing = false;
      
      if (this.showCallback) {
        this.showCallback(false, error.message);
        this.showCallback = null;
      }
      
      if (this.rewardCallback) {
        this.rewardCallback(false);
        this.rewardCallback = null;
      }
    }
  }

  // 获取广告状态
  getAdStatus(): AdStatus {
    return { ...this.adStatus };
  }

  // 检查广告是否加载
  async isAdLoaded(): Promise<boolean> {
    try {
      if (BaiduAd) {
        const result = await BaiduAd.isAdLoaded({});
        return result.isLoaded;
      }
    } catch (error) {
      console.error('检查广告状态失败:', error);
    }
    return this.adStatus.isLoaded;
  }
}

// 导出单例实例
export const adService = new AdService();
