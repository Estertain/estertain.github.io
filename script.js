document.addEventListener('DOMContentLoaded', function() {
    // ตั้งค่าความเร็วการโหลด
    const MAX_CONCURRENT_LOADS = 6;
    let currentLoads = 0;
    const pendingVideos = [];
    
    // ฟังก์ชันโหลดวิดีโอจริง
    function loadVideo(video) {
        const container = video.closest('.video-container');
        const src = video.getAttribute('data-src');
        
        // เปลี่ยนเป็น src จริง
        video.setAttribute('src', src);
        
        // เมื่อโหลดเสร็จ
        video.onload = function() {
            currentLoads--;
            container.classList.add('loaded');
            
            // โหลดวิดีโอถัดไปในคิว
            if (pendingVideos.length > 0) {
                loadVideo(pendingVideos.shift());
            }
        };
    }
    
    // สร้าง Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target.querySelector('.lazy-iframe');
                
                if (video && !video.getAttribute('src')) {
                    if (currentLoads < MAX_CONCURRENT_LOADS) {
                        currentLoads++;
                        loadVideo(video);
                    } else {
                        pendingVideos.push(video);
                    }
                }
                
                // หยุดสังเกตเมื่อโหลดแล้ว
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '200px', // โหลดล่วงหน้าเมื่อใกล้จะเห็น 200px
        threshold: 0.1
    });
    
    // เริ่มสังเกต video containers ทั้งหมด
    document.querySelectorAll('.video-container').forEach(container => {
        observer.observe(container);
        
        // เพิ่มการคลิกที่ placeholder เพื่อโหลดทันที
        container.querySelector('.video-placeholder').addEventListener('click', function() {
            const video = container.querySelector('.lazy-iframe');
            if (video && !video.getAttribute('src')) {
                loadVideo(video);
            }
        });
    });
    
    // โหลดวิดีโอ 2 อันแรกทันที
    const initialVideos = document.querySelectorAll('.video-container:nth-child(-n+2) .lazy-iframe');
    initialVideos.forEach(video => {
        if (!video.getAttribute('src')) {
            if (currentLoads < MAX_CONCURRENT_LOADS) {
                currentLoads++;
                loadVideo(video);
            } else {
                pendingVideos.push(video);
            }
        }
    });
});
