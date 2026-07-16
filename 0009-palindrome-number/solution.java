class Solution {
    public boolean isPalindrome(int x) {
        if ( x < 0 ){
            return false;
           }
        int org = x , rem , rev = 0;
        while ( x != 0 ){
            rem = 0;
            rem = x % 10;
            rev = rev * 10 + rem;
            x = x / 10;
        }
        return org == rev;
    }
}
