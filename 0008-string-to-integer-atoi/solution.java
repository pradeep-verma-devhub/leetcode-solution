class Solution {
    public int myAtoi(String s) {
        int sign = 1,i = 0, num = 0 , digit = 0, n = s.length();
        while ( i < n && s.charAt(i)==' '){
           i++;
        }
        if(i < n && (s.charAt(i) == '+'|| s.charAt(i) == '-')){
            if(s.charAt(i) == '-'){
                sign = -1;
            }
            i++;
        }
        if ( i>=n || !Character.isDigit(s.charAt(i))){
            return 0;
        }
        while ( i < n  && Character.isDigit(s.charAt(i))){
            digit = s.charAt(i) -'0';
            if ( num > (Integer.MAX_VALUE - digit )/10){
                if ( sign == 1 ){
                    return Integer.MAX_VALUE;
                }
                else{
                    return Integer.MIN_VALUE;
                }
            }
            
            num = num * 10 + digit;
            i++;
        
        }
        return (num * sign);
        
    }
}
