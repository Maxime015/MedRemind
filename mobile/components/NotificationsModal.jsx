import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";

export default function NotificationsModal({ visible, onClose, medications }) {
  
  const formatTime = (timeString) => {
    if (!timeString) return "Not defined";
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString; // Return original string in case of error
    }
  };

  const getFrequencyText = (frequency) => {
    const freqMap = {
      'once': 'Once',
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'custom': 'Custom',
      'as_needed': 'As needed'
    };
    return freqMap[frequency] || frequency || 'Not specified';
  };

  // ADDED: Function to format treatment duration
  const getDurationText = (duration, startDate) => {
    if (!duration) return 'Duration not specified';
    
    if (duration === 'Ongoing' || duration === -1) {
      return 'Continuous treatment';
    }
    
    // If it's a number (in days)
    if (typeof duration === 'number' || !isNaN(duration)) {
      const days = parseInt(duration);
      if (days === 1) return '1 day';
      return `${days} days`;
    }
    
    // If it's a string like "7 days", "30 days", etc.
    if (typeof duration === 'string') {
      if (duration.toLowerCase().includes('ongoing')) {
        return 'Continuous treatment';
      }
      // Extract number and unit
      const match = duration.match(/(\d+)\s*(\w+)/);
      if (match) {
        const number = match[1];
        const unit = match[2].toLowerCase();
        
        const unitMap = {
          'day': 'day',
          'days': 'days',
          'week': 'week',
          'weeks': 'weeks',
          'month': 'month',
          'months': 'months'
        };
        
        const translatedUnit = unitMap[unit] || unit;
        return `${number} ${translatedUnit}`;
      }
    }
    
    return duration;
  };

  // ADDED: Function to calculate treatment end date
  const getEndDate = (startDate, duration) => {
    if (!startDate || !duration || duration === 'Ongoing' || duration === -1) {
      return null;
    }
    
    try {
      const start = new Date(startDate);
      let days = 0;
      
      if (typeof duration === 'number') {
        days = duration;
      } else if (typeof duration === 'string') {
        if (duration.toLowerCase().includes('ongoing')) {
          return null;
        }
        // Extract number of days
        const match = duration.match(/(\d+)/);
        if (match) {
          days = parseInt(match[0]);
        }
      }
      
      if (days > 0) {
        const endDate = new Date(start);
        endDate.setDate(start.getDate() + days);
        return endDate.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    } catch {
      // In case of parsing error
    }
    
    return null;
  };

  const getStatusColor = (med) => {
    // Determine status based on available data
    if (med.lastTaken) return COLORS.success; // Already taken
    if (med.times && med.times.length > 0) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const medicationTimes = med.times.map(time => {
        const [hours, minutes] = time.split(':');
        return parseInt(hours) * 60 + parseInt(minutes);
      });
      
      const nextTime = medicationTimes.find(t => t > currentTime);
      if (nextTime) return COLORS.primary; // Upcoming
      return COLORS.warning; // Pending
    }
    return COLORS.textLight; // Default
  };

  const getStatusText = (med) => {
    if (med.lastTaken) return 'Taken';
    if (med.times && med.times.length > 0) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const medicationTimes = med.times.map(time => {
        const [hours, minutes] = time.split(':');
        return parseInt(hours) * 60 + parseInt(minutes);
      });
      
      const nextTime = medicationTimes.find(t => t > currentTime);
      if (nextTime) return 'Upcoming';
      return 'Pending';
    }
    return 'Not scheduled';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Function to get next dose time
  const getNextDoseTime = (med) => {
    if (!med.times || med.times.length === 0) return null;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const medicationTimes = med.times.map(time => {
      const [hours, minutes] = time.split(':');
      return parseInt(hours) * 60 + parseInt(minutes);
    }).sort((a, b) => a - b);
    
    const nextTime = medicationTimes.find(t => t > currentTime) || medicationTimes[0];
    
    // If it's for tomorrow
    const isTomorrow = !medicationTimes.find(t => t > currentTime);
    const nextDate = new Date(now);
    if (isTomorrow) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    const hours = Math.floor(nextTime / 60);
    const minutes = nextTime % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    return {
      date: nextDate.toISOString(),
      time: timeString,
      isTomorrow
    };
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Notifications</Text>
              <Text style={styles.modalSubtitle}>
                {medications.length} medication{medications.length > 1 ? 's' : ''} scheduled
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {medications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={64} color={COLORS.textLight} />
                <Text style={styles.emptyStateTitle}>No notifications</Text>
                <Text style={styles.emptyStateText}>
                  You don't have any medications scheduled at the moment
                </Text>
              </View>
            ) : (
              medications.map((med) => {
                const statusColor = getStatusColor(med);
                const statusText = getStatusText(med);
                const nextDose = getNextDoseTime(med);
                const frequency = med.frequency || med.scheduleType || 'daily'; // Fallback to daily
                const durationText = getDurationText(med.duration, med.startDate); // ADDED
                const endDate = getEndDate(med.startDate, med.duration); // ADDED
                
                return (
                  <View key={med.id} style={styles.notificationCard}>
                    {/* Card header */}
                    <View style={styles.notificationHeader}>
                      <View style={styles.medicationInfo}>
                        <View style={[styles.medicationIcon, { backgroundColor: `${med.color}20` }]}>
                          <Ionicons name="medical" size={20} color={med.color} />
                        </View>
                        <View>
                          <Text style={styles.medicationName}>{med.name}</Text>
                          <Text style={styles.medicationDosage}>{med.dosage}</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {statusText}
                        </Text>
                      </View>
                    </View>

                    {/* Detailed information */}
                    <View style={styles.notificationDetails}>
                      {/* Times */}
                      <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
                        <Text style={styles.detailLabel}>Times: </Text>
                        <Text style={styles.detailValue}>
                          {med.times && med.times.length > 0 
                            ? med.times.map(time => formatTime(time)).join(', ')
                            : "Not defined"
                          }
                        </Text>
                      </View>

                      {/* Frequency */}
                      <View style={styles.detailRow}>
                        <Ionicons name="repeat-outline" size={16} color={COLORS.textLight} />
                        <Text style={styles.detailLabel}>Frequency: </Text>
                        <Text style={styles.detailValue}>
                          {getFrequencyText(frequency)}
                        </Text>
                      </View>

                      {/* ADDED: Treatment duration */}
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
                        <Text style={styles.detailLabel}>Duration: </Text>
                        <Text style={styles.detailValue}>
                          {durationText}
                          {endDate && ` (until ${endDate})`}
                        </Text>
                      </View>

                      {/* Start date */}
                      {med.startDate && (
                        <View style={styles.detailRow}>
                          <Ionicons name="play-circle-outline" size={16} color={COLORS.textLight} />
                          <Text style={styles.detailLabel}>Start: </Text>
                          <Text style={styles.detailValue}>
                            {formatDate(med.startDate)}
                          </Text>
                        </View>
                      )}

                      {/* Next dose */}
                      {nextDose && (
                        <View style={styles.detailRow}>
                          <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
                          <Text style={styles.detailLabel}>Next dose: </Text>
                          <Text style={styles.detailValue}>
                            {nextDose.isTomorrow ? 'Tomorrow' : 'Today'} at {formatTime(nextDose.time)}
                          </Text>
                        </View>
                      )}

                      {/* Additional instructions */}
                      {med.instructions && (
                        <View style={styles.instructionsRow}>
                          <Ionicons name="information-circle-outline" size={16} color={COLORS.textLight} />
                          <Text style={styles.instructionsText}>
                            {med.instructions}
                          </Text>
                        </View>
                      )}

                      {/* Remaining stock */}
                      {med.stock && (
                        <View style={styles.detailRow}>
                          <Ionicons name="cube-outline" size={16} color={COLORS.textLight} />
                          <Text style={styles.detailLabel}>Stock: </Text>
                          <Text style={styles.detailValue}>
                            {med.stock} unit{med.stock > 1 ? 's' : ''}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Actions */}
                    <View style={styles.notificationActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.success} />
                        <Text style={[styles.actionText, { color: COLORS.success }]}>
                          Mark as taken
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="alarm-outline" size={18} color={COLORS.primary} />
                        <Text style={[styles.actionText, { color: COLORS.primary }]}>
                          Remind later
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
