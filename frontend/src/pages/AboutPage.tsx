import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Leaf, Users, Target, Award, Heart, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const AboutPage: React.FC = () => {
    const { t } = useLanguage();

    const team = [
        { name: "MD SHAZAN MAHMUD ARPON", role: "Lead Developer", emoji: "👨‍💻" },
        { name: "RAFIUR RAHMAN", role: "Developer", emoji: "👨‍💻" },
        { name: "MD SAZZAD HOSSAIN SAZID", role: "Developer", emoji: "👨‍💻" },
        { name: "KHALID ADNAN", role: "Developer", emoji: "👨‍💻" }
    ];

    const values = [
        {
            icon: <Heart className="h-8 w-8" />,
            title: t('about.value_farmer'),
            description: t('about.value_farmer_desc')
        },
        {
            icon: <Target className="h-8 w-8" />,
            title: t('about.value_quality'),
            description: t('about.value_quality_desc')
        },
        {
            icon: <Zap className="h-8 w-8" />,
            title: t('about.value_innovation'),
            description: t('about.value_innovation_desc')
        },
        {
            icon: <Users className="h-8 w-8" />,
            title: t('about.value_community'),
            description: t('about.value_community_desc')
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-primary text-primary-foreground py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary opacity-90"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <Leaf className="h-16 w-16 mx-auto mb-4 opacity-90" />
                        <h1 className="text-5xl font-bold mb-4">{t('about.title')}</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            {t('about.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-2xl">{t('about.mission')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed">
                                    {t('about.mission_text')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-2xl">{t('about.vision')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed">
                                    {t('about.vision_text')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-2">{t('about.values_title')}</h2>
                        <p className="text-muted-foreground">{t('about.values_subtitle')}</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <Card key={index} className="group hover:shadow-xl hover:border-primary transition-all">
                                <CardHeader className="text-center">
                                    <div className="flex justify-center mb-3 text-primary group-hover:scale-110 transition-transform">{value.icon}</div>
                                    <CardTitle className="text-lg">{value.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-center text-sm">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-12 text-center">{t('about.why_title')}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <Award className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>{t('about.why_middlemen')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    {t('about.why_middlemen_desc')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <Users className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>{t('about.why_expert')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    {t('about.why_expert_desc')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <Zap className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>{t('about.why_technology')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    {t('about.why_technology_desc')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">{t('about.story_title')}</h2>
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                                {t('about.story_p1')}
                            </p>
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                                {t('about.story_p2')}
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('about.story_p3')}
                            </p>
                        </div>
                        <div className="text-6xl text-center lg:text-8xl opacity-80">🌾🥬🍅🐟</div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-16 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-12 text-center">{t('about.team_title')}</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {team.map((member, index) => (
                            <Card key={index} className="text-center hover:shadow-lg hover:scale-105 transition-all">
                                <CardHeader>
                                    <div className="text-5xl mb-2">{member.emoji}</div>
                                    <CardTitle className="text-lg">{member.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm">{member.role}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-primary text-primary-foreground">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">{t('about.cta_title')}</h2>
                    <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                        {t('about.cta_subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/marketplace">
                            <Button size="lg" variant="secondary">
                                {t('about.browse_products')}
                            </Button>
                        </Link>
                        <Link to="/auth?tab=signup">
                            <Button size="lg" variant="outline" className="border-2 bg-transparent hover:bg-primary-foreground/10">
                                {t('about.start_selling')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
