require('dotenv').config();
const mongoose = require('mongoose');
const locationService = require('./src/services/location.service');

async function testMapBackend() {
    try {
        console.log('--- BẮT ĐẦU KIỂM THỬ BACKEND BẢN ĐỒ VĂN HÓA & ĐỊA PHƯƠNG ---');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sep490');

        // 1. Test getLocations
        console.log('\n1. Test getLocations (Tất cả địa phương & số tác phẩm)...');
        const locations = await locationService.getLocations();
        console.log(`✓ Số lượng địa phương trả về: ${locations.length}`);
        if (locations.length === 0) throw new Error('Không có địa phương nào!');
        const firstLoc = locations[0];
        console.log(`✓ Mẫu địa phương: "${firstLoc.name}", Tọa độ: [${firstLoc.coordinates.lat}, ${firstLoc.coordinates.lng}], Tác phẩm: ${firstLoc.worksCount}`);

        // 2. Test getLocations với bộ lọc thể loại
        console.log('\n2. Test getLocations với bộ lọc ca-dao...');
        const caDaoLocs = await locationService.getLocations({ category: 'ca-dao' });
        console.log(`✓ Số địa phương có ca dao: ${caDaoLocs.filter(l => l.worksCount > 0).length}`);

        // 3. Test getLocationByIdOrSlug
        console.log('\n3. Test getLocationByIdOrSlug với slug "ha-noi-thang-long"...');
        const hanoi = await locationService.getLocationByIdOrSlug('ha-noi-thang-long');
        if (!hanoi) throw new Error('Không tìm thấy Hà Nội!');
        console.log(`✓ Tìm thấy: "${hanoi.name}" - ${hanoi.description.substring(0, 50)}...`);

        // 4. Test getLocationWorks
        console.log('\n4. Test getLocationWorks (Danh sách tác phẩm của Hà Nội)...');
        const hanoiWorks = await locationService.getLocationWorks('ha-noi-thang-long', { page: 1, limit: 5 });
        console.log(`✓ Tổng số tác phẩm của Hà Nội: ${hanoiWorks.pagination.total}`);
        hanoiWorks.works.forEach((w, idx) => {
            console.log(`   ${idx + 1}. [${w.category}] ${w.title} (Quan hệ: ${w.relationType})`);
        });

        // 5. Test getMapWorks (Toàn bộ markers + sample works)
        console.log('\n5. Test getMapWorks (Dữ liệu bản đồ toàn quốc)...');
        const mapData = await locationService.getMapWorks({ category: 'all' });
        console.log(`✓ Tổng markers trên bản đồ: ${mapData.markers.length}`);
        const markerWithWorks = mapData.markers.find(m => m.sampleWorks && m.sampleWorks.length > 0);
        console.log(`✓ Marker mẫu có preview: "${markerWithWorks.name}" có ${markerWithWorks.sampleWorks.length} tác phẩm xem trước`);

        // 6. Test invalid ID / slug
        console.log('\n6. Test xử lý địa phương không tồn tại...');
        const nonExistent = await locationService.getLocationByIdOrSlug('dia-phuong-khong-ton-tai');
        if (nonExistent === null) {
            console.log('✓ Xử lý chính xác: trả về null khi không tìm thấy địa phương.');
        } else {
            throw new Error('Mong đợi null nhưng nhận được kết quả khác!');
        }

        console.log('\n========================================');
        console.log('🎉 TẤT CẢ TEST BACKEND BẢN ĐỒ VĂN HÓA ĐÃ THÀNH CÔNG VƯỢT TRỘI!');
        console.log('========================================');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

testMapBackend();
