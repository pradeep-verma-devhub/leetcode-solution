
import axios from "axios";

console.log("LeetCode Sync Started");

console.log("Session Found:", !!process.env.LEETCODE_SESSION);
console.log("CSRF Found:", !!process.env.LEETCODE_CSRF_TOKEN);

try {
  const res = await axios.get("https://leetcode.com");
  console.log("LeetCode Status:", res.status);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
