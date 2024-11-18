<template>
  <Paypal 
    :amount="amount"
    :showRefundButton="false"
  />

</template>
<script setup>
import Paypal from '../components/Paypal.vue';
import { ref, onMounted, getCurrentInstance, nextTick, computed } from "vue";

const amount= ref('10.00');
</script>