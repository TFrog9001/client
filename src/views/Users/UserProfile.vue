<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Thông tin người dùng</h1>
    <div class="grid gap-6 md:grid-cols-2">
      <!-- User Information -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Thông tin cá nhân</h2>
        </div>
        <div class="card-body">
          <div class="mb-4">
            <img
              :src="
                user.avatar ||
                'https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png'
              "
              alt="User Avatar"
              class="img-thumbnail"
              width="100"
            />
          </div>
          <div>
            <label class="form-label">Tên</label>
            <input
              type="text"
              class="form-control"
              v-model="user.name"
              disabled
            />
          </div>
          <div class="mt-3">
            <label class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              v-model="user.email"
              disabled
            />
          </div>
          <div class="mt-3">
            <label class="form-label">Số điện thoại</label>
            <input
              type="tel"
              class="form-control"
              v-model="user.phone"
              disabled
            />
          </div>
        </div>
      </div>

      <!-- Booking History with Filter -->
      <div class="card mt-3">
        <div class="card-header">
          <h2 class="card-title">Lịch sử đặt sân</h2>
        </div>
        <div class="card-body">
          <!-- Status Filter Tags -->
          <div id="tag" class="mb-3">
            <button
              class="btn mx-1 mb-2"
              :class="
                selectedStatus === 'All' ? 'btn-primary' : 'btn-outline-primary'
              "
              @click="filterByStatus('All')"
            >
              All
            </button>
            <button
              class="btn mx-1 mb-2"
              :class="
                selectedStatus === 'Đã đặt'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              "
              @click="filterByStatus('Đã đặt')"
            >
              Đã đặt
            </button>
            <button
              class="btn mx-1 mb-2"
              :class="
                selectedStatus === 'Đã cọc'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              "
              @click="filterByStatus('Đã cọc')"
            >
              Đã cọc
            </button>
            <button
              class="btn mx-1 mb-2"
              :class="
                selectedStatus === 'Đã thanh toán'
                  ? 'btn-success'
                  : 'btn-outline-success'
              "
              @click="filterByStatus('Đã thanh toán')"
            >
              Đã thanh toán
            </button>
            <button
              class="btn mx-1 mb-2"
              :class="
                selectedStatus === 'Hủy' ? 'btn-danger' : 'btn-outline-danger'
              "
              @click="filterByStatus('Hủy')"
            >
              Hủy
            </button>
          </div>

          <!-- Filter Section -->
          <div class="mb-3 grid grid-cols-1 gap-4 md:grid-cols-3">
            <v-row class="ma-3">
              <v-col>
                <div>
                  <label class="form-label">Từ ngày</label>
                  <input type="date" class="form-control" v-model="startDate" />
                </div>
              </v-col>
              <v-col>
                <div>
                  <label class="form-label">Đến ngày</label>
                  <input type="date" class="form-control" v-model="endDate" />
                </div>
              </v-col>
              <v-col>
                <div class="flex items-end mt-8">
                  <button
                    @click="resetFilters"
                    class="btn btn-secondary w-full"
                  >
                    Reset
                  </button>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Booking Table -->
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Tên sân</th>
                  <th>Ngày đặt</th>
                  <th>Khung giờ</th>
                  <th>Trạng thái</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="paginatedBookings.length === 0">
                  <td colspan="4" class="text-center">No bookings found</td>
                </tr>
                <tr
                  v-else
                  v-for="booking in paginatedBookings"
                  :key="booking.id"
                >
                  <td>{{ booking.field.name }}</td>
                  <td>{{ formatDate(booking.booking_date) }}</td>
                  <td>
                    {{ formatTime(booking.start_time) }} -
                    {{ formatTime(booking.end_time) }}
                  </td>
                  <td>{{ booking.status }}</td>
                  <td>
                    <button
                      class="btn btn-link"
                      @click="viewBookingDetails(booking.id)"
                      title="View Details"
                    >
                      <i class="fa fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div class="mt-4 d-flex flex-row-reverse">
            <button
              class="btn btn-primary"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              Next
            </button>
            <span class="mx-1 mt-1"
              >Page {{ currentPage }} of {{ totalPages }}</span
            >
            <button
              class="btn btn-primary"
              :disabled="currentPage === 1"
              @click="prevPage"
            >
              Previous
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import bookingService from "@/services/bookingService";
import { useRouter } from "vue-router"; // Dùng để chuyển trang

const authStore = useAuthStore();
const user = ref({});
const bookingHistory = ref([]);
const startDate = ref("");
const endDate = ref("");
const selectedStatus = ref("All"); // Trạng thái được chọn
const router = useRouter(); // Khởi tạo router để chuyển trang

// Pagination variables
const currentPage = ref(1);
const itemsPerPage = 5; // Number of bookings per page

const viewBookingDetails = (bookingId) => {
  router.push(`/booking/${bookingId}`); // Chuyển hướng đến trang chi tiết booking
};

// Fetch user data and bookings on component mount
onMounted(async () => {
  await authStore.fetchUser();
  user.value = authStore.user;

  // Fetch bookings by user ID
  try {
    const response = await bookingService.getUserBooking(user.value.id);
    bookingHistory.value = response.data; // Load toàn bộ lịch sử booking của user
  } catch (error) {
    console.error("Lỗi khi lấy danh sách booking:", error);
  }
});

// Filtered bookings based on selected date range and status
const filteredBookings = computed(() => {
  let filtered = bookingHistory.value;

  // Lọc theo startDate nếu có
  if (startDate.value) {
    filtered = filtered.filter(
      (booking) => booking.booking_date >= startDate.value
    );
  }

  // Lọc theo endDate nếu có
  if (endDate.value) {
    filtered = filtered.filter(
      (booking) => booking.booking_date <= endDate.value
    );
  }

  // Lọc theo status nếu có
  if (selectedStatus.value !== "All") {
    filtered = filtered.filter(
      (booking) => booking.status === selectedStatus.value
    );
  }

  return filtered;
});

// Paginated bookings based on current page and items per page
const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredBookings.value.slice(start, end);
});

// Total pages for pagination
const totalPages = computed(() => {
  return Math.ceil(filteredBookings.value.length / itemsPerPage);
});

// Handle next and previous page
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Function to filter by status
const filterByStatus = (status) => {
  selectedStatus.value = status;
  currentPage.value = 1; // Reset to page 1 when changing status
};

// Reset filter
const resetFilters = () => {
  startDate.value = "";
  endDate.value = "";
  selectedStatus.value = "All";
  currentPage.value = 1;
};

// Format date to 'dd/mm/yyyy'
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB"); // Chuyển đổi thành dd/mm/yyyy
};

// Format time to 'hh:mm'
const formatTime = (timeStr) => {
  const [hour, minute] = timeStr.split(":");
  return `${hour}:${minute}`;
};
</script>

<style>
.card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
}
.card-header {
  padding-bottom: 16px;
}
.card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.btn-spacing {
  margin-right: 10px; /* Thay đổi khoảng cách theo ý muốn */
}
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
