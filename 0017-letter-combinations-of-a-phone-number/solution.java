class Solution {
    public List<String> letterCombinations(String digits) {
        List<String> result = new ArrayList<>();
        String[] char_at_num = {"","","abc","def","ghi","jkl","mno","pqrs","tuv","wxyz"};
        result.add("");
        for( int i = 0 ; i < digits.length() ; i++){
            String letter = char_at_num[digits.charAt(i)-'0'];
            List<String> temp = new ArrayList<>();
            for(int j = 0 ; j < result. size() ; j++){
              String s = result.get(j);
              for(int k = 0 ; k < letter.length() ; k++){
                  temp.add( s + letter.charAt(k));
              }  
            }
            result = temp;
        }
        return result;       
    }
}
