<template>
  <div>
    <!-- PayPal Button Container -->
    <div v-if="!showRefundButton" id="paypal-button-container"></div>

    <!-- Refund Button -->
    <button v-if="showRefundButton" @click="handleRefund">Refund</button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { loadScript } from "@paypal/paypal-js";
import { showNotification } from "../utils/notification";

// Prop từ component cha
const props = defineProps({
  showRefundButton: {
    type: Boolean,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["paymentSuccess", "paymentError"]);

const clientId =
  "AR-__Sbyg9YxPWMoLn7Aj2HJJY0ymqMe6JpsDq_xd2tk_V5-KKAr4JYIQ_ldqRfuJ3GwC7x0-eJ9V62d"; // Thay bằng client ID thật
const secret =
  "EIc--r_538vcm1rB8_hPqbEkwo_xxr9s4oTPHZp8JW4ezXxy7V3Og20Yu4S-FVUBAp8inuRI2KRu4zoW"; // Thay bằng secret thật
const captureId = ref(null); // Store captureId for refund process
const accessToken = ref(null); // Store access token for API calls
const amount = ref(0);

onMounted(async () => {
  const paypal = await loadScript({
    "client-id": clientId,
    currency: "USD",
    intent: "capture",
  });

  paypal
    .Buttons({
      createOrder(data, actions) {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: amount.value,
              },
            },
          ],
        });
      },
      onApprove(data, actions) {
        return actions.order.capture().then((details) => {
          // alert("Payment successful: " + details.payer.name.given_name);
          showNotification({
            title: "Thông báo",
            message: "Thanh toán với paypal thành công",
            type: "success",
          });
          captureId.value = details.purchase_units[0].payments.captures[0].id;
          emit("paymentSuccess", {
            transactionId: captureId.value,
            details,
          });
        });
      },
      onError(err) {
        console.error("Error during payment:", err);
      },
    })
    .render("#paypal-button-container");
});

async function getAccessToken() {
  try {
    const auth = btoa(`${clientId}:${secret}`);

    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
        }),
      }
    );

    const data = await response.json();
    accessToken.value = data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    alert("Failed to get access token.");
  }
}

async function handleRefund() {
  if (!accessToken.value) {
    await getAccessToken();
  }

  if (!captureId.value || !accessToken.value) {
    alert("Capture ID or Access Token is missing.");
    return;
  }

  try {
    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v2/payments/captures/${captureId.value}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken.value}`,
        },
      }
    );

    const transactionDetails = await response.json();

    if (response.ok) {
      const refundAmount =
        transactionDetails.seller_receivable_breakdown.net_amount.value;

      const refundResponse = await fetch(
        `https://api-m.sandbox.paypal.com/v2/payments/captures/${captureId.value}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken.value}`,
          },
          body: JSON.stringify({
            amount: {
              value: refundAmount,
              currency_code: "USD",
            },
          }),
        }
      );

      const result = await refundResponse.json();
      if (refundResponse.ok) {
        showNotification({
          title: "Thông báo",
          message: "Đã hủy thành công và tiền đã được hoàn vào ví của bạn",
          type: "success",
        });
      } else {
        alert(`Refund failed: ${result.message || "Unknown error"}`);
      }
    } else {
      alert(
        `Failed to retrieve transaction details: ${
          transactionDetails.message || "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error("Refund error:", error);
    alert("Refund request failed");
  }
}

onMounted(() => {
  console.log(props.amount);
  const amountString =
    typeof props.amount === "string" ? props.amount : props.amount.toString();
  const sanitizedAmount = parseFloat(amountString.replace(/\./g, "")) / 24000;
  amount.value = sanitizedAmount.toFixed(2);
});

watch(
  () => props.amount,
  (newCost, oldCost) => {
    // console.log(`Cost changed from ${oldCost} to ${newCost}`);
    const amountString =
      typeof props.amount === "string" ? props.amount : props.amount.toString();
    const sanitizedAmount = parseFloat(amountString.replace(/\./g, "")) / 24000;
    amount.value = sanitizedAmount.toFixed(2);
  }
);
</script>

<style scoped>
/* Add any styles you want for the PayPal button */
</style>
