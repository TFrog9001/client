<template>
  <div id="botman-widget-container"></div>
</template>

<script>
export default {
  mounted() {
    // Extract JWT token from cookies
    const token = this.getCookie("token");

    // Cấu hình BotMan Widget
    window.botmanWidget = {
      frameEndpoint: "http://127.0.0.1:8000/botman/chat",
      introMessage: "Xin chào! Tôi có thể giúp gì cho bạn?",
      title: "Booky 🤖",
      chatServer: "http://127.0.0.1:8000/botman",
      mainColor: "#00897B",
      bubbleBackground: "#00897B",
      aboutText: "",
      headers: {
        // Set the Authorization header with the JWT token
        Authorization: `Bearer ${token}`,
      },
    };

    // Thêm script để khởi tạo widget
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/botman-web-widget@0/build/js/widget.js";
    script.onload = () => {
      console.log("BotMan Widget loaded successfully.");
    };
    document.getElementById("botman-widget-container").appendChild(script);
  },

  methods: {
    getCookie(name) {
      // Get the cookie by name
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    },
  },
};
</script>

<style scoped>
/* Tùy chỉnh icon mic */
.bmw-input {
  position: relative;
}

.bmw-input i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #408591; /* Thay đổi màu nếu cần */
  z-index: 1;
}

.bmw-input input {
  padding-left: 30px; /* Đảm bảo không bị che khuất bởi icon */
}
</style>
