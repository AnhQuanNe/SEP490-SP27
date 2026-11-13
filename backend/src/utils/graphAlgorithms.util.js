/**
 * graphAlgorithms.util.js
 * Các thuật toán đồ thị thuần túy (Pure Functions) phục vụ Đồ thị Tri thức
 * Tách biệt hoàn toàn khỏi Database và các tầng I/O để đảm bảo tính minh bạch và dễ Unit Test.
 */

/**
 * Thuật toán BFS (Breadth-First Search) tìm đường đi ngắn nhất giữa 2 thực thể trên đồ thị
 * @param {Array} nodes Danh sách toàn bộ nốt của đồ thị
 * @param {Array} links Danh sách toàn bộ cạnh kết nối
 * @param {string} sourceId ID nốt khởi nguồn
 * @param {string} targetId ID nốt đích đến
 * @returns {Object} { found: boolean, length: number, path: Array, links: Array }
 */
function findShortestPathBFS(nodes, links, sourceId, targetId) {
    if (!sourceId || !targetId || !Array.isArray(nodes) || !Array.isArray(links)) {
        return { found: false, length: 0, path: [], links: [] };
    }

    if (sourceId === targetId) {
        const node = nodes.find((n) => n.id === sourceId);
        return {
            found: true,
            length: 0,
            path: node ? [node] : [],
            links: [],
        };
    }

    // Xây dựng danh sách kề (Adjacency List)
    const adj = {};
    nodes.forEach((n) => (adj[n.id] = []));
    links.forEach((l) => {
        adj[l.source]?.push({ neighbor: l.target, relation: l.relation, label: l.label, description: l.description });
        adj[l.target]?.push({ neighbor: l.source, relation: l.relation, label: l.label, description: l.description });
    });

    // Hàng đợi BFS
    const queue = [sourceId];
    const visited = new Set([sourceId]);
    const parentMap = {};

    let found = false;
    while (queue.length > 0) {
        const current = queue.shift();
        if (current === targetId) {
            found = true;
            break;
        }

        for (const edge of adj[current] || []) {
            if (!visited.has(edge.neighbor)) {
                visited.add(edge.neighbor);
                parentMap[edge.neighbor] = {
                    node: current,
                    relation: edge.relation,
                    label: edge.label,
                    description: edge.description,
                };
                queue.push(edge.neighbor);
            }
        }
    }

    if (!found) {
        return { found: false, length: 0, path: [], links: [] };
    }

    // Truy vết ngược đường đi từ đích về nguồn
    const pathNodes = [];
    const pathLinks = [];
    let curr = targetId;

    while (curr !== sourceId) {
        const p = parentMap[curr];
        const currNode = nodes.find((n) => n.id === curr);
        const parentNode = nodes.find((n) => n.id === p.node);
        pathNodes.unshift(currNode);
        pathLinks.unshift({
            source: p.node,
            target: curr,
            relation: p.relation,
            label: p.label,
            description: p.description,
            sourceName: parentNode?.name,
            sourceType: parentNode?.type,
            sourceSummary: parentNode?.summary || parentNode?.details || '',
            targetName: currNode?.name,
            targetType: currNode?.type,
            targetSummary: currNode?.summary || currNode?.details || '',
            targetLesson: currNode?.lesson || '',
        });
        curr = p.node;
    }
    pathNodes.unshift(nodes.find((n) => n.id === sourceId));

    return {
        found: true,
        length: pathNodes.length - 1,
        path: pathNodes,
        links: pathLinks,
    };
}

/**
 * Tính toán Degree Centrality (Bậc liên kết) để điều chỉnh kích thước nốt cân đối
 * và xác định danh sách các Trụ cột Triết lý cốt lõi (Major Hubs / Pillars)
 * @param {Array} nodes Danh sách nốt
 * @param {Array} links Danh sách cạnh
 * @param {number} topHubCount Số lượng trụ cột lớn nhất cần đánh dấu
 * @returns {Object} { degreeMap, majorHubs }
 */
function calculateDegreeCentrality(nodes, links, topHubCount = 4) {
    const degreeMap = {};
    links.forEach((link) => {
        degreeMap[link.source] = (degreeMap[link.source] || 0) + 1;
        degreeMap[link.target] = (degreeMap[link.target] || 0) + 1;
    });

    // Xác định top Trụ cột Triết lý cốt lõi (Philosophy Pillars) có tầm ảnh hưởng lớn nhất
    const philosophyNodes = nodes.filter((n) => n.type === 'philosophy');
    philosophyNodes.sort((a, b) => {
        const degA = degreeMap[a.id] || 0;
        const degB = degreeMap[b.id] || 0;
        return degB - degA;
    });

    const topMajorHubIds = new Set(philosophyNodes.slice(0, topHubCount).map((n) => n.id));

    nodes.forEach((node) => {
        const degree = degreeMap[node.id] || 1;
        node.degree = degree;

        if (topMajorHubIds.has(node.id)) {
            // Trụ cột văn hóa cốt lõi - Trọng tâm thị giác số 1 của đồ thị
            node.isMajorHub = true;
            node.isPillar = true;
            node.val = Math.max(38, 30 + degree * 1.5);
        } else if (node.type === 'philosophy') {
            node.val = Math.max(22, 18 + degree * 1.2);
        } else if (node.type === 'archetype') {
            node.val = Math.max(16, 13 + degree * 1.0);
        } else if (node.type === 'region') {
            node.val = Math.max(16, 13 + degree * 0.9);
        } else {
            // Tác phẩm lá non (Tầng 4) - Nhỏ gọn, tinh tế
            node.val = Math.max(8, 6 + degree * 0.5);
        }
    });

    const majorHubs = nodes
        .filter((n) => n.isMajorHub)
        .map((n) => ({
            id: n.id,
            name: n.name,
            type: n.type,
            color: n.color,
            degree: n.degree,
            summary: n.summary,
        }));

    return { degreeMap, majorHubs };
}

module.exports = {
    findShortestPathBFS,
    calculateDegreeCentrality,
};

