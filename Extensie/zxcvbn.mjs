// zxcvbn.mjs transformare din UMD in ESM (ca s afolosesc module)
import './zxcvbn-umd.js';

const zxcvbn = window.zxcvbn;
export default zxcvbn;