import { View, Text, TouchableOpacity } from 'react-native';

// Definisikan tipe untuk data laporan
interface Report {
  judul: string;
  isi: string;
  // tambahkan properti lain jika ada (id, status, dll)
}

// Definisikan tipe props untuk komponen
interface ReportCardProps {
  item: Report;
  onPress: () => void;
}

export default function ReportCard({ item, onPress }: ReportCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 3,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
        {item.judul}
      </Text>

      <Text style={{ color: '#666', marginTop: 5 }} numberOfLines={2}>
        {item.isi}
      </Text>
    </TouchableOpacity>
  );
}