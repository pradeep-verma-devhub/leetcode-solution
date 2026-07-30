class Solution {
    public int lengthOfLastWord(String s){
        int count = 0;
        int last = 0;
        for (int i = 0 ; i < s.length(); i++){
            if (s.charAt(i) != ' '){
                count++;
                last = count;
            }
            else{
                count = 0;
            }
        }
        return last;
    }
}
