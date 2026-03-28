"use client";

import config from "devextreme/core/config";

const LicenseCheck = () => {
  if (typeof window !== "undefined") {
    const key = process.env.NEXT_PUBLIC_DEVEXTREME_LICENSE_KEY;
    
    // 코드 실행 시점에 브라우저 콘솔에 찍히도록 설정
    console.log("Vercel 환경변수 로드 상태:", key ? `${key.substring(0, 5)}...` : "키 없음 (undefined)");
    
    if (key) {
      config({ licenseKey: key });
    }
  }
  return null;
};

export default LicenseCheck;