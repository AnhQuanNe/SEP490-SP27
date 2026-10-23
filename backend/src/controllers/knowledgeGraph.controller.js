const knowledgeGraphService = require('../services/knowledgeGraph.service');

class KnowledgeGraphController {
    /**
     * @route   GET /api/literature/knowledge-graph
     * @desc    Lấy toàn bộ dữ liệu Đồ thị Tri thức Dân gian (Nodes, Links, Summary, Categories)
     * @access  Public
     */
    async getGraph(req, res, next) {
        try {
            const data = await knowledgeGraphService.getGraphData();
            res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /api/literature/knowledge-graph/shortest-path
     * @desc    Tìm đường đi ngắn nhất giữa 2 thực thể tri thức (BFS Graph Traversal)
     * @access  Public
     */
    async getShortestPath(req, res, next) {
        try {
            const { source, target } = req.query;
            if (!source || !target) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp định danh source và target',
                });
            }

            const result = await knowledgeGraphService.getShortestPath(source, target);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new KnowledgeGraphController();
