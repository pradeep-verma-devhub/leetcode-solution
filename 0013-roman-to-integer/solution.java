class Solution {
    public int romanToInt(String s) {

        int[] value = { 1000 , 900 , 500 , 400 , 100 , 90 , 50 , 40 , 10 , 9 , 8 , 7 , 6 , 5 , 4 , 3 , 2 ,1 };
        String[] roman = { "M","CM","D","CD","C","XC","L","XL","X","IX","VIII","VII","VI","V","IV","III","II","I"};    
            int ans = 0 , i = 0;
        while (i < s.length()) {
            for (int j = 0; j < roman.length; j++) {
                if (s.startsWith(roman[j], i)) {
                    ans += value[j];
                    i += roman[j].length();
                    break;
                }
            }
        }

        return ans;
    }
}
