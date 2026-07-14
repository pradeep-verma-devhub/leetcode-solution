class Solution {
    public int maxArea(int[] height) {
        int left = 0 , right = height.length - 1 , max_area = 0 , area = 0;
        while ( left < right ){
            int length = Math.min( height[left] , height[right]);
            int breadth = right - left ;
            area = length * breadth ;
             
            if ( area > max_area ) {
                max_area = area ;
            }
            if ( height [left] < height [right]){
                left++;
            }
            else{
                right --;
            }
        }
        return max_area;
    }
}
