class Solution {
    public String longestPalindrome(String s) {
       String ans = "";
       int i,j,k,n = s.length();
       
       for ( i = 0 ; i < n ; i++ ){
           
           for ( j = i ; j < n;j++){
               
               String sub = s.substring(i,j+1);
               String rev = "";
               
               
               for (k = sub.length() - 1;k >= 0 ;k--){
                   rev = rev + sub.charAt(k);
               }
                   if (sub.equals(rev)){
                       if(sub.length()>ans.length()){
                       ans=sub;
                      }
                   }
               
           }
      }
           
     return ans;    
           
     }
   
}  

// This is acceptable at test case but due to O(n³) time complexity it fails in leetcode submission test case , so we use O(n²) time complexity algo .