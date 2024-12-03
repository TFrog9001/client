<template>
  <button
    type="button"
    class="btn text"
    :class="{
      'btn-outline-warning': props.text_title,
      'btn-link': !props.text_title,
    }"
    @click="openForgotPasswordDialog = true"
  >
    <!-- Thêm icon khi có props.text_title -->
    <i v-if="props.text_title" class="fas fa-shield-alt me-2"></i>
    {{ props.text_title || "Quên mật khẩu?" }}
  </button>

  <!-- Modal -->
  <div
    class="modal fade"
    :class="{ show: openForgotPasswordDialog }"
    tabindex="-1"
    style="display: block"
    v-if="openForgotPasswordDialog"
    @click.self="resetForm()"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content p-4 rounded-3">
        <!-- Modal Header -->
        <div class="modal-header">
          <h5 class="modal-title">Quên mật khẩu</h5>
          <button
            type="button"
            class="btn-close"
            @click="openForgotPasswordDialog = false"
          ></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <form>
            <!-- Số điện thoại -->
            <div class="mb-3">
              <label for="phone" class="form-label">Số điện thoại</label>
              <input
                id="phone"
                type="text"
                v-model="form.phone"
                class="form-control"
                :readonly="props.phone ? true : false"
              />
              <div v-if="errors.phone" class="text-danger">
                {{ errors.phone }}
              </div>

              <button
                type="button"
                class="btn btn-primary mt-2 w-100"
                :disabled="isOtpSent || loadingOtp || !form.phone"
                @click="sendOtp"
              >
                <span
                  v-if="loadingOtp"
                  class="spinner-border spinner-border-sm"
                ></span>
                Gửi OTP
              </button>

              <small v-if="isOtpSent" class="text-danger mt-2 d-block">
                Đợi {{ countdown }} giây để gửi lại OTP
              </small>
            </div>

            <!-- OTP -->
            <div class="mb-3" v-if="otpSent">
              <label for="otp" class="form-label">Nhập mã OTP</label>
              <v-otp-input
                id="otp"
                v-model="form.otp"
                :num-otps="6"
                class="otp-input"
                :disabled="loadingOtp"
              />
              <div v-if="errors.otp" class="text-danger">
                {{ errors.otp }}
              </div>
              <button
                type="button"
                class="btn btn-success w-100 mt-3"
                :disabled="loadingOtp || !form.otp"
                @click="verifyOtp"
              >
                <span
                  v-if="loadingOtp"
                  class="spinner-border spinner-border-sm"
                ></span>
                Xác nhận OTP
              </button>
            </div>

            <!-- Mật khẩu mới -->
            <div v-if="otpVerified">
              <div class="mb-3">
                <label for="new-password" class="form-label"
                  >Mật khẩu mới</label
                >
                <input
                  id="new-password"
                  type="password"
                  v-model="form.new_password"
                  class="form-control"
                  placeholder="Nhập mật khẩu mới"
                />
                <div v-if="errors.new_password" class="text-danger">
                  {{ errors.new_password }}
                </div>
              </div>
              <div class="mb-3">
                <label for="new-password-confirmation" class="form-label"
                  >Xác nhận mật khẩu mới</label
                >
                <input
                  id="new-password-confirmation"
                  type="password"
                  v-model="form.new_password_confirmation"
                  class="form-control"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
              <button
                type="button"
                class="btn btn-primary w-100"
                :disabled="
                  loadingReset ||
                  !form.new_password ||
                  !form.new_password_confirmation
                "
                @click="resetPassword"
              >
                <span
                  v-if="loadingReset"
                  class="spinner-border spinner-border-sm"
                ></span>
                Đặt lại mật khẩu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, watch } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";

const props = defineProps({
  text_title: {
    type: String,
  },
  phone: {
    type: String,
  },
});

const openForgotPasswordDialog = ref(false);
const form = ref({
  phone: props.phone || "",
  otp: "",
  new_password: "",
  new_password_confirmation: "",
});
const errors = ref({
  phone: "",
  otp: "",
  new_password: "",
});
const reset_token = ref("");

const otpSent = ref(false);
const otpVerified = ref(false);
const loadingOtp = ref(false);
const loadingReset = ref(false);
const countdown = ref(0);
const isOtpSent = ref(false); // Thêm flag để kiểm tra OTP đã được gửi hay chưa

const validatePhone = (phone) => {
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/; // Regex kiểm tra số điện thoại VN
  return phoneRegex.test(phone);
};

const sendOtp = async () => {
  if (isOtpSent.value) return; // Tránh gửi OTP khi đang trong countdown

  if (!validatePhone(form.value.phone)) {
    errors.value.phone = "Số điện thoại không hợp lệ!";
    return;
  }
  errors.value.phone = null;

  try {
    loadingOtp.value = true;
    const response = await axios.post(
      "http://127.0.0.1:8000/api/auth/forgot-password/send-otp",
      {
        phone: form.value.phone,
      }
    );

    if (response.status == 200) {
      console.log(response);
      otpSent.value = true;
      isOtpSent.value = true;
      startCountdown();
    } else {
      ElMessage.error(response.data.message);
    }
  } catch (error) {
    ElMessage.error("Bạn không thể gửi tiếp OTP quá nhiều lần");
  } finally {
    loadingOtp.value = false;
  }
};

const startCountdown = () => {
  countdown.value = 45;
  const countdownInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(countdownInterval);
      isOtpSent.value = false; // Cho phép gửi lại OTP sau khi countdown kết thúc
    }
  }, 1000);
};

const verifyOtp = async () => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/auth/forgot-password/verify-otp",
      {
        phone: form.value.phone,
        otp: form.value.otp,
      }
    );
    if (response.status == 200) {
      reset_token.value = response.data.reset_token;
      otpVerified.value = true;
    } else {
      ElMessage.error("OTP không hợp lệ!");
    }
  } catch (error) {
    ElMessage.error("Lỗi xác nhận OTP!");
  }
};

const resetPassword = async () => {
  try {
    loadingReset.value = true;
    console.log(form.value);

    const response = await axios.post(
      "http://127.0.0.1:8000/api/auth/reset-password",
      {
        phone: form.value.phone,
        reset_token: reset_token.value, // Token sẽ được trả về sau khi xác nhận OTP
        new_password: form.value.new_password,
        new_password_confirmation: form.value.new_password_confirmation,
      }
    );
    console.log(response);

    if (response.status == 200) {
      ElMessage.success("Mật khẩu đã được thay đổi!");
      resetForm();
      openForgotPasswordDialog.value = false;
    } else {
      ElMessage.error("Đặt lại mật khẩu thất bại!");
    }
  } catch (error) {
    ElMessage.error("Lỗi khi đặt lại mật khẩu!");
  } finally {
    loadingReset.value = false;
  }
};

const resetForm = () => {
  form.value = {
    phone: props.phone || "",
    otp: "",
    new_password: "",
    new_password_confirmation: "",
  };
  errors.value = {
    phone: "",
    otp: "",
    new_password: "",
  };
  otpSent.value = false;
  otpVerified.value = false;
  isOtpSent.value = false;
};

watch(
  () => props.phone,
  (newPhone) => {
    form.value.phone = newPhone || "";
  }
);
</script>

<style scoped>
.otp-input {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.otp-input input {
  width: 45px;
  height: 45px;
  text-align: center;
  font-size: 18px;
  border: 1px solid #ced4da;
  border-radius: 5px;
}

.otp-input input:focus {
  border-color: #409eff;
  outline: none;
  box-shadow: 0 0 5px rgba(64, 158, 255, 0.6);
}
</style>
