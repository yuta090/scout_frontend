import { JobCategory } from '../types';

export const TRANSPORTATION_CATEGORIES: JobCategory = {
  id: 'transportation',
  name: '交通/運輸/物流専門職',
  subcategories: [
    {
      id: 'driver',
      name: 'ドライバー/乗務員',
      jobs: [
        { id: 'taxi_driver', name: 'タクシードライバー/ハイヤードライバー', value: 'fb48e' },
        { id: 'private_driver', name: '専属運転手', value: 'ffb1f' },
        { id: 'substitute_driver', name: '運転代行', value: 'f4aeb' },
        { id: 'bus_driver', name: 'バス運転手', value: 'ef58f' },
        { id: 'bus_attendant', name: 'バス添乗員', value: '4798c' },
        { id: 'delivery_driver', name: '配送/宅配/セールスドライバー', value: 'eff29' },
        { id: 'long_distance_driver', name: '運送ドライバー(中長距離)', value: '928b9' },
        { id: 'tanker_driver', name: 'タンクローリードライバー', value: '0d65d' },
        { id: 'driver_other', name: 'その他', value: '51dd8' }
      ]
    },
    {
      id: 'road_transport',
      name: '道路交通/陸運',
      jobs: [
        { id: 'operation_management', name: '運行管理', value: '4e1cd' },
        { id: 'traffic_control', name: '道路交通管制', value: '89f3a' },
        { id: 'mechanic', name: '整備士', value: '0629b' },
        { id: 'road_transport_other', name: 'その他', value: '67288' }
      ]
    },
    {
      id: 'railway',
      name: '鉄道',
      jobs: [
        { id: 'transport_planning', name: '輸送計画/運用計画', value: '864aa' },
        { id: 'operation_control', name: '運行管理/指令', value: '83f70' },
        { id: 'train_crew', name: '鉄道乗務員', value: '377b0' },
        { id: 'station_staff', name: '駅員', value: 'bce35' },
        { id: 'crew_training', name: '乗務員指導/育成', value: '56089' },
        { id: 'maintenance_planning', name: '車両/設備メンテナンス/工事計画管理', value: '680e08' },
        { id: 'technical_management', name: '車両/設備技術管理', value: '19dc9' },
        { id: 'equipment_inspection', name: '車両/設備検査', value: '66ffd' },
        { id: 'equipment_design', name: '車両/設備設計', value: '779b8' },
        { id: 'construction_management', name: '車両/設備施工管理', value: '12829' },
        { id: 'maintenance', name: '車両/設備メンテナンス/整備', value: '2082f' },
        { id: 'maintenance_control', name: '車両/設備整備指令', value: 'aa45a' },
        { id: 'railway_other', name: 'その他', value: 'f98aa' }
      ]
    },
    {
      id: 'air_transport',
      name: '空運/空港関連',
      jobs: [
        { id: 'pilot', name: '運航乗務員/パイロット', value: 'f64b8' },
        { id: 'cabin_attendant', name: '客室乗務員/FA', value: 'f22bc' },
        { id: 'passenger_service', name: '旅客係員', value: 'b5690' },
        { id: 'ramp_staff', name: 'ランプ係員', value: '7dd5f' },
        { id: 'fueling_staff', name: '給油係員', value: '33f57' },
        { id: 'dispatcher', name: '運航管理者/ディスパッチャー', value: '54f59' },
        { id: 'crew_management', name: '乗務管理', value: '6f3fc' },
        { id: 'flight_standards', name: '運航基準', value: 'ef8ec' },
        { id: 'flight_operations', name: '運航技術', value: '31f5e' },
        { id: 'aircraft_maintenance', name: '航空機整備士', value: 'd6d23' },
        { id: 'indirect_operations', name: '間接部門', value: '4178f' },
        { id: 'safety_management', name: '安全管理', value: 'dcd97' },
        { id: 'transportation', name: '運送', value: '0de9a' },
        { id: 'air_transport_other', name: 'その他', value: '23b64' }
      ]
    },
    {
      id: 'marine_transport',
      name: '海運/港湾関連',
      jobs: [
        { id: 'marine_planning', name: '運航計画/運航管理', value: '5cf64' },
        { id: 'vessel_procurement', name: '船舶調達', value: '998cf' },
        { id: 'safety_environment', name: '安全運航/環境推進', value: 'de42f' },
        { id: 'technical_development', name: '技術開発', value: '26ada' },
        { id: 'shipbuilding', name: '新造船計画/建造', value: '2189b' },
        { id: 'contract_negotiation', name: '建造契約交渉', value: 'c9bbe' },
        { id: 'maintenance_repair', name: '保守/修繕', value: '691d0' },
        { id: 'navigation_officer', name: '航海士', value: '3758c' },
        { id: 'engineer_officer', name: '機関士', value: '968ac' },
        { id: 'radio_officer', name: '通信士', value: 'ffe6b' },
        { id: 'ship_crew', name: '船舶乗務員', value: '8e04c' },
        { id: 'route_management', name: '航路管理', value: '9be64' },
        { id: 'dockmaster', name: '操船技師/ドックマスター', value: '86d14' },
        { id: 'cargo_supervisor', name: '荷役監督', value: '4eab4' },
        { id: 'container_management', name: 'コンテナ管理', value: 'd319e' },
        { id: 'marine_transport_other', name: 'その他', value: '9e975' }
      ]
    },
    {
      id: 'logistics_management',
      name: '物流手配/管理',
      jobs: [
        { id: 'operations_management', name: '運営管理', value: '8818f' },
        { id: 'forwarder', name: 'フォワーダー', value: 'bc3f3' },
        { id: 'logistics_management_other', name: 'その他', value: '0ef6f' }
      ]
    },
    {
      id: 'warehouse',
      name: '倉庫/配送センター',
      jobs: [
        { id: 'warehouse_management', name: '倉庫管理', value: '705a4' },
        { id: 'warehouse_staff', name: '倉庫作業スタッフ', value: '8eded' },
        { id: 'forklift_driver', name: 'フォークリフトドライバー', value: '16865' },
        { id: 'warehouse_other', name: 'その他', value: '3536c' }
      ]
    },
    {
      id: 'transportation_other',
      name: 'その他',
      jobs: [
        { id: 'transportation_other', name: 'その他', value: '8f5d5' }
      ]
    }
  ]
};