class Solution {
    public String intToRoman(int num) {
        int[] value = { 1000 , 900 , 500 , 400 , 100 , 90 , 50 , 40 , 10 , 9 , 8 , 7 , 6 , 5 , 4 , 3 , 2 ,1 };
        String[] roman = { "M","CM","D","CD","C","XC","L","XL","X","IX","VIII","VII","VI","V","IV","III","II","I"};
        String ans = "";
        for(int i = 0 ; i < value.length ; i++){
            while(num >= value[i]){
                num = num - value[i];
                ans = ans + roman[i];
            }
        }
        return ans;
    }
}
