<script>
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default {
    components: {
        FullCalendar
    },
    data() {
        return {
            calendarOptions: {
                plugins: [timeGridPlugin, interactionPlugin],
                initialView: 'timeGridDay',
                dateClick: this.handleDateClick,
                slotMinTime: "00:00:00",
                slotMaxTime: "24:00:00",
                slotLabelFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                },
                events: [
                    {
                        title: 'Sân 1 - 500,000 VND',
                        start: '2024-09-09T10:00:00',
                        end: '2024-09-09T12:00:00'
                    },
                    {
                        title: 'Sân 2 - 300,000 VND',
                        start: '2024-09-09T13:00:00',
                        end: '2024-09-09T15:00:00'
                    }
                ]
            }
        }
    },
    methods: {
        handleDateClick: function (arg) {
            alert('date click! ' + arg.dateStr)
        }
    }
}
</script>

<template>
    <v-card>
        <FullCalendar :options="calendarOptions" />
    </v-card>
</template>
