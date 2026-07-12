class Solution {
    public int lengthOfLongestSubstring(String s) {
        String str = "";
        int max = 0;
        for ( int i = 0 ;i < s.length() ; i++){
            char ch = s.charAt(i);
           int j = 0 ;

            while(j < str.length()){
                if(str.charAt(j) == ch){
                    str = str.substring(1);
                    j = 0;
                }
                else{
                    j++;
                }
            }
                str = str + ch;
                if(str.length() > max){
                    max = str.length();
                }
            }
        return max;
        }
    }
    
                                                                          
