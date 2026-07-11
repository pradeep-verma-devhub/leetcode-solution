/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode num = new ListNode(0);
        ListNode nums = num;
        
        int sum = 0,digit=0,carry =0;;
        
        while(l1 != null || l2 != null || carry != 0){
            sum = carry;
            if(l1 != null){
                sum = sum + l1.val;
            }
            if(l2 != null){
                sum = sum + l2.val;
            }
            carry=sum/10;
            digit=sum%10;
   
   
            nums.next = new ListNode(digit) ;
          
           nums=nums.next;
          if(l1 != null){
              l1 = l1.next;
          }
          if(l2 != null ){
              l2 = l2.next;
          }
          
           
        }
        return num.next;
    }
}
