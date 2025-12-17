import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    category: string;
    image: string;
}

const BlogDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Sample blog posts (same as BlogsPage)
    const blogPosts: BlogPost[] = [
        {
            id: 1,
            title: "10 Tips for Organic Tomato Farming",
            excerpt: "Learn the best practices to grow organic tomatoes without chemical pesticides...",
            content: `Growing organic tomatoes requires proper soil preparation, regular watering, and natural pest control methods. In this comprehensive guide, we cover everything from seed selection to harvest.

**1. Soil Preparation**
Start with rich, well-draining soil. Mix compost and organic matter to improve soil fertility. The ideal pH for tomatoes is between 6.0 and 6.8.

**2. Seed Selection**
Choose disease-resistant varieties suitable for your climate. Heirloom varieties often have better flavor but may need extra care.

**3. Watering Schedule**
Water deeply but infrequently. Tomatoes need consistent moisture, especially during fruit development. Drip irrigation is ideal.

**4. Natural Pest Control**
Use companion planting with basil and marigolds. Neem oil spray can control aphids and other pests naturally.

**5. Mulching**
Apply organic mulch around plants to retain moisture, suppress weeds, and regulate soil temperature.

**6. Pruning**
Remove suckers to direct energy to fruit production. Prune lower leaves to improve air circulation.

**7. Staking and Support**
Use cages or stakes to support plants as they grow. This prevents fruit from touching soil and reduces disease risk.

**8. Fertilization**
Use compost tea or fish emulsion every 2-3 weeks during growing season. Avoid over-fertilizing with nitrogen.

**9. Disease Prevention**
Rotate crops yearly. Space plants properly for air circulation. Remove diseased leaves immediately.

**10. Harvesting**
Pick tomatoes when fully colored but still firm. They'll continue ripening off the vine if needed.`,
            author: "Md. Karim",
            date: "Dec 10, 2024",
            category: "Organic Farming",
            image: "🍅"
        },
        {
            id: 2,
            title: "Understanding Market Prices: A Farmer's Guide",
            excerpt: "How to track and predict agricultural prices for better decision making...",
            content: `Market prices fluctuate based on supply, demand, and seasonal factors. This guide helps farmers understand price trends and negotiate better deals.

Understanding market dynamics is crucial for maximizing profits and planning production. Here's everything you need to know about agricultural pricing.

**Supply and Demand**
The fundamental principle: when supply exceeds demand, prices fall. When demand exceeds supply, prices rise. Monitor production forecasts in your region.

**Seasonal Patterns**
Most crops have predictable seasonal price patterns. Prices typically peak when supply is lowest and drop during harvest season.

**Regional Variations**
Prices vary significantly by location based on transportation costs, local demand, and regional production levels.

**Market Intelligence**
Use mobile apps and government websites to track daily prices. Join farmer cooperatives for better market information.

**Negotiation Strategies**
Don't accept the first offer. Know your costs and minimum acceptable price. Consider quality premiums for superior produce.

**Storage and Timing**
If you have storage facilities, you can wait for better prices. However, factor in storage costs and spoilage risks.

**Diversification**
Growing multiple crops reduces price risk. If one crop's price drops, others may compensate.`,
            author: "Fatima Khan",
            date: "Dec 8, 2024",
            category: "Market Trends",
            image: "📊"
        },
        {
            id: 3,
            title: "Best Practices for Rice Cultivation",
            excerpt: "Maximize your rice yield with these proven cultivation techniques...",
            content: `Rice farming has been central to Bangladesh's agriculture for centuries. Modern techniques combined with traditional knowledge can significantly increase productivity.

**Land Preparation**
Proper land preparation is crucial. Plow fields when soil moisture is optimal. Level fields carefully for even water distribution.

**Seed Treatment**
Treat seeds with salt water to remove empty grains. Soak seeds in clean water for 24 hours before planting.

**Seedling Care**
Raise seedlings in nursery beds with good drainage. Transplant when seedlings are 21-25 days old.

**Water Management**
Maintain 2-5 cm water depth throughout growing season. Drain fields before harvest to ease cutting.

**Fertilizer Application**
Apply organic compost before planting. Use urea in split doses during different growth stages.

**Weed Control**
Hand weeding or using traditional tools. Maintain water depth to suppress weed growth.

**Pest Management**
Monitor for stem borers and leaf folders. Use pheromone traps and biological control methods.

**Harvesting**
Harvest when 80% of grains are golden yellow. Proper timing prevents shattering and quality loss.`,
            author: "Abdul Rahman",
            date: "Dec 5, 2024",
            category: "Farming Tips",
            image: "🌾"
        },
        {
            id: 4,
            title: "Managing Pest Problems Naturally",
            excerpt: "Effective organic methods to protect crops from common pests...",
            content: `Chemical pesticides harm the environment and increase costs. Learn natural pest management techniques that are both effective and sustainable.

**Integrated Pest Management (IPM)**
IPM combines multiple strategies: cultural, biological, and mechanical controls before considering any pesticides.

**Beneficial Insects**
Encourage ladybugs, lacewings, and predatory wasps. Plant flowers to attract these natural pest controllers.

**Companion Planting**
Marigolds repel aphids. Garlic deters many insects. Basil protects tomatoes from various pests.

**Physical Barriers**
Use row covers, nets, and sticky traps. Handpicking works well for larger insects like caterpillars.

**Neem Oil**
A natural pesticide effective against soft-bodied insects. Mix with water and spray in early morning or evening.

**Crop Rotation**
Break pest life cycles by rotating plant families. Never plant the same crop family in the same spot consecutively.

**Healthy Soil**
Healthy plants resist pests better. Maintain soil fertility with compost and organic matter.

**Monitoring**
Regularly inspect plants. Early detection allows for easier control of pest problems.`,
            author: "Dr. Aisha Ahmed",
            date: "Dec 1, 2024",
            category: "Pest Management",
            image: "🐛"
        },
        {
            id: 5,
            title: "IoT Technology in Modern Farming",
            excerpt: "How sensors and data analytics are transforming agriculture...",
            content: `Internet of Things (IoT) technology allows farmers to monitor soil moisture, temperature, and crop health in real-time, leading to better decision making.

**What is Agricultural IoT?**
IoT connects physical devices (sensors, controllers) to the internet, enabling remote monitoring and automation.

**Soil Sensors**
Monitor moisture, pH, and nutrient levels. Receive alerts on your smartphone when irrigation is needed.

**Weather Stations**
Track temperature, humidity, rainfall, and wind. Predict optimal times for planting and spraying.

**Automated Irrigation**
Save water and labor with smart irrigation systems. Water is applied only when and where needed.

**Drone Technology**
Aerial imagery reveals crop health issues invisible from ground level. Identify stressed areas early.

**Livestock Monitoring**
Track animal health, location, and feeding patterns. Early disease detection saves costs.

**Cost-Benefit Analysis**
Initial investment can be significant, but savings in water, fertilizer, and labor provide good returns.

**Getting Started**
Start small with basic sensors. Gradually expand as you see benefits and learn the technology.`,
            author: "Karim Rahman",
            date: "Nov 28, 2024",
            category: "Technology",
            image: "📱"
        },
        {
            id: 6,
            title: "Seasonal Vegetable Planting Guide",
            excerpt: "Know when and what to plant for maximum yield throughout the year...",
            content: `Bangladesh's climate allows for multiple harvests throughout the year. This guide helps you plan what vegetables to grow in each season.

**Winter Season (November-February)**
Best time for: Tomatoes, cauliflower, cabbage, carrots, lettuce, peas, radish, and spinach.

**Summer Season (March-June)**  
Heat-tolerant crops: Okra, bitter gourd, bottle gourd, pumpkin, cucumber, and amaranth.

**Rainy Season (July-October)**
Water-resistant varieties: Ridge gourd, snake gourd, taro, and water spinach.

**Year-Round Crops**
Some vegetables grow well all year: Eggplant, chili peppers, and coriander.

**Succession Planting**
Plant small batches every 2-3 weeks for continuous harvest. Works well for lettuce, radish, and beans.

**Micro-Climates**
Use shade nets in summer, polytunnels in winter to extend growing seasons.

**Soil Preparation**
Each season requires specific soil amendments. Test soil pH and nutrients before planting.

**Profit Planning**
Grow off-season vegetables in controlled environments for premium prices.`,
            author: "Hasan Ali",
            date: "Nov 25, 2024",
            category: "Farming Tips",
            image: "🥬"
        }
    ];

    const blog = blogPosts.find(b => b.id === parseInt(id || '0'));

    if (!blog) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="py-12 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h2>
                            <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
                            <Button onClick={() => navigate('/blogs')} className="bg-green-600 hover:bg-green-700">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blogs
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate('/blogs')}
                    className="mb-6 hover:bg-gray-100"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blogs
                </Button>

                {/* Blog Content */}
                <Card className="overflow-hidden">
                    {/* Header Image */}
                    <div className="bg-gradient-to-br from-green-100 to-green-50 h-48 flex items-center justify-center text-8xl">
                        {blog.image}
                    </div>

                    <CardHeader className="space-y-4">
                        {/* Category Badge */}
                        <div className="flex items-center gap-2">
                            <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                                <Tag className="inline h-3 w-3 mr-1" />
                                {blog.category}
                            </span>
                        </div>

                        {/* Title */}
                        <CardTitle className="text-3xl md:text-4xl leading-tight">
                            {blog.title}
                        </CardTitle>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{blog.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{blog.date}</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="prose prose-lg max-w-none">
                        {/* Content with proper formatting */}
                        <div className="text-gray-700 leading-relaxed space-y-4">
                            {blog.content.split('\n\n').map((paragraph, index) => {
                                // Check if paragraph is a heading (starts with **)
                                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                    const headingText = paragraph.replace(/\*\*/g, '');
                                    return (
                                        <h3 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                                            {headingText}
                                        </h3>
                                    );
                                }
                                return (
                                    <p key={index} className="text-base">
                                        {paragraph}
                                    </p>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Related Posts Section */}
                <div className="mt-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">More Articles</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {blogPosts
                            .filter(b => b.id !== blog.id && b.category === blog.category)
                            .slice(0, 3)
                            .map(relatedBlog => (
                                <Link
                                    key={relatedBlog.id}
                                    to={`/blogs/${relatedBlog.id}`}
                                    className="group"
                                >
                                    <Card className="hover:shadow-lg transition-shadow h-full">
                                        <div className="bg-gradient-to-br from-green-100 to-green-50 h-24 flex items-center justify-center text-4xl">
                                            {relatedBlog.image}
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                                                {relatedBlog.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {relatedBlog.excerpt}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetailPage;
