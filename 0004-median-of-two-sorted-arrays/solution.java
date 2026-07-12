class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int i,m = nums1.length;
        int n = nums2.length;
        int len = m + n;
        int[] arr = new int[len];
        double ret =0;
        for( i = 0; i < m ; i++){
            arr[i] = nums1[i];
        }  
        for( i = 0 ; i < n ; i++){
            arr[ m+i] = nums2[i];
        }

        Arrays.sort(arr);
        
        if(len % 2 == 0){
            ret = (arr[len/2-1] + arr[len/2]) / 2.0;

        }
        else{
            ret = arr[len / 2];
        }


        return ret;
    }
}
