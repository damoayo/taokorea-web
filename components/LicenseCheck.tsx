"use client";

import config from "devextreme/core/config";

const LicenseCheck = () => {
  if (typeof window !== "undefined") {
    // .env에 저장한 키를 불러옵니다.
    const key = process.env.NEXT_PUBLIC_DEVEXTREME_LICENSE_KEY;
    
    if (key) {
      config({ licenseKey: key });
    }
  }
  return null;
};

export default LicenseCheck;