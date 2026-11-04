const knowledgeGraphService = require('../services/knowledgeGraph.service');

class KnowledgeGraphController {
    /**
     * @route   GET /api/literature/knowledge-graph
     * @desc    Lấy toàn bộ dữ liệu Đồ thị Tri thức Dân gian ĐỘNG từ Database (Nodes, Links, Summary, Categories)
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
            const { source, target, withAi } = req.query;
            if (!source || !target) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp định danh source và target',
                });
            }

            if (withAi === 'true') {
                const result = await knowledgeGraphService.explainPathWithAI(source, target);
                return res.status(200).json({
                    success: true,
                    data: result,
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

    /**
     * @route   POST /api/literature/knowledge-graph/ai-explain-path
     * @desc    AI Real 100%: Luận giải chuyên sâu mạch nguồn văn hóa kết nối 2 thực thể
     * @access  Public
     */
    async explainPathWithAI(req, res, next) {
        try {
            const { source, target } = req.body;
            if (!source || !target) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp source và target để AI luận giải',
                });
            }

            const result = await knowledgeGraphService.explainPathWithAI(source, target);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /api/literature/knowledge-graph/ai-inspect-node
     * @desc    AI Real 100%: Luận giải chuyên sâu một thực thể tri thức đơn lẻ
     * @access  Public
     */
    async inspectNodeWithAI(req, res, next) {
        try {
            const { nodeId } = req.body;
            if (!nodeId) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp nodeId để AI phân tích',
                });
            }

            const result = await knowledgeGraphService.inspectNodeWithAI(nodeId);
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
