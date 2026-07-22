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
    public ListNode removeNthFromEnd(ListNode head, int n) {
       int length = 0;
       ListNode end = head;
       ListNode prev = head;
       while(end != null){
           length++;
           end = end.next;
       } 
       if(length == n){
           return head.next;
       }
       int index = length - n - 1;
       while(index > 0){
           prev = prev.next;
           index--;
       }
       prev.next = prev.next.next;
       return head;     
    }
}
