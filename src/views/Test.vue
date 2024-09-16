<template>
  <div>
    <!-- Hiển thị thông tin sân -->
    <h2>Thông tin sân: {{ field.name }}</h2>
    <p>Vị trí: {{ field.location }}</p>
    <p>Loại sân: {{ field.type }}</p>
    <p>Trạng thái: {{ field.status }}</p>

    <h3>Giá theo khoảng thời gian:</h3>
    <ul>
      <li v-for="(price, index) in field.prices" :key="index">
        {{ formatTime(price.start_time) }} - {{ formatTime(price.end_time) }}:
        {{ formatPrice(price.price) }} VNĐ ({{ price.day_type }})
      </li>
    </ul>

    <!-- Thêm form thêm giá mới -->
    <form @submit.prevent="addTimeRange">
      <input
        v-model="newRange.startTime"
        type="time"
        placeholder="Thời gian bắt đầu"
        required
      />
      <input
        v-model="newRange.endTime"
        type="time"
        placeholder="Thời gian kết thúc"
        required
      />
      <input
        v-model.number="newRange.price"
        type="number"
        placeholder="Giá"
        required
      />
      <select v-model="newRange.dayType" required>
        <option value="Ngày thường">Ngày thường</option>
        <option value="Cuối tuần">Cuối tuần</option>
      </select>
      <button type="submit">Thêm khoảng thời gian</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Dữ liệu sân bóng
const field = ref({
  id: 1,
  name: "Sân AB1",
  location: "123 Đường ABC",
  type: "7",
  status: "Không hoạt động",
  created_at: "2024-07-25T14:47:03.000000Z",
  updated_at: "2024-09-14T13:22:39.000000Z",
  prices: [
    {
      id: 9,
      field_id: 1,
      start_time: "06:00:00",
      end_time: "08:00:00",
      day_type: "Ngày thường",
      price: "200000.00",
      created_at: "2024-09-13T04:47:07.000000Z",
      updated_at: "2024-09-13T05:14:42.000000Z",
    },
    {
      id: 1,
      field_id: 1,
      start_time: "08:00:00",
      end_time: "10:00:00",
      day_type: "Ngày thường",
      price: "500000.00",
      created_at: "2024-07-25T14:47:03.000000Z",
      updated_at: "2024-07-25T14:47:03.000000Z",
    },
    {
      id: 2,
      field_id: 1,
      start_time: "10:00:00",
      end_time: "13:00:00",
      day_type: "Ngày thường",
      price: "600000.00",
      created_at: "2024-07-25T14:47:03.000000Z",
      updated_at: "2024-09-14T13:41:03.000000Z",
    },
  ],
});

// Biến để lưu giá trị của khoảng thời gian mới
const newRange = ref({
  startTime: "",
  endTime: "",
  price: null,
  dayType: "Ngày thường",
});

// Hàm để format lại giờ từ định dạng chuỗi
const formatTime = (time) => {
  return time.slice(0, 5); // Bỏ giây để hiển thị HH:MM
};

// Hàm để format lại giá tiền
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN").format(price);
};

// Hàm để thêm khoảng thời gian giá mới
const addTimeRange = () => {
  const { startTime, endTime, price, dayType } = newRange.value;

  // Kiểm tra tính hợp lệ
  if (startTime >= endTime || price <= 0) {
    alert("Khoảng thời gian không hợp lệ hoặc giá phải lớn hơn 0");
    return;
  }

  // Tạo một mảng mới để lưu kết quả sau khi xử lý
  let newPrices = [];

  // Xử lý việc trùng thời gian
  field.value.prices.forEach((priceRange) => {
    // Nếu khoảng thời gian mới không chồng lên khoảng thời gian hiện có
    if (endTime <= priceRange.start_time || startTime >= priceRange.end_time) {
      newPrices.push(priceRange); // Thêm khoảng thời gian không bị ảnh hưởng
    } else {
      // Nếu khoảng thời gian mới chồng lên, cần chia lại các khoảng thời gian
      if (startTime > priceRange.start_time) {
        newPrices.push({
          ...priceRange,
          end_time: startTime, // Cắt phần kết thúc của khoảng hiện tại
        });
      }

      if (endTime < priceRange.end_time) {
        newPrices.push({
          ...priceRange,
          start_time: endTime, // Cắt phần bắt đầu của khoảng hiện tại
        });
      }
    }
  });

  // Thêm khoảng thời gian mới vào mảng
  newPrices.push({
    id: field.value.prices.length + 1, // Tạo id mới
    field_id: field.value.id,
    start_time: startTime,
    end_time: endTime,
    day_type: dayType,
    price: price.toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Sắp xếp lại mảng theo thời gian bắt đầu
  newPrices.sort((a, b) => {
    return a.start_time.localeCompare(b.start_time);
  });

  // Cập nhật danh sách giá với mảng mới đã xử lý
  field.value.prices = newPrices;

  // Reset form
  newRange.value = {
    startTime: "",
    endTime: "",
    price: null,
    dayType: "Ngày thường",
  };
};
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 5px;
}
form {
  margin-top: 20px;
}
form input,
form select {
  margin-right: 10px;
}
</style>
