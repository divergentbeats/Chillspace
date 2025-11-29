import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SupportYouth = () => {
    const navigate = useNavigate();

    const resources = [
        {
            title: "Mental Health America",
            description: "Tools and information for mental wellness.",
            link: "https://mhanational.org/"
        },
        {
            title: "The Trevor Project",
            description: "Crisis intervention and suicide prevention for LGBTQ youth.",
            link: "https://www.thetrevorproject.org/"
        },
        {
            title: "Child Mind Institute",
            description: "Resources for families and educators.",
            link: "https://childmind.org/"
        },
        {
            title: "Active Minds",
            description: "Empowering students to speak openly about mental health.",
            link: "https://www.activeminds.org/"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 p-6">

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <span className="text-2xl">←</span>
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white font-sans text-center flex-1">
                        Support the Youth 🌟
                    </h1>
                    <div className="w-10"></div>
                </div>

                {/* Intro */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-12 text-center"
                >
                    <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-4">
                        You Are Not Alone
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Mental health is a journey, and it's okay to ask for help. Whether you're looking for professional support, community, or just information, there are people and organizations ready to stand by your side.
                    </p>
                </motion.div>

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resources.map((resource, index) => (
                        <motion.a
                            key={index}
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="block bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-teal-500 hover:translate-x-2"
                        >
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
                                {resource.title}
                                <span className="ml-2 text-sm text-gray-400">↗</span>
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {resource.description}
                            </p>
                        </motion.a>
                    ))}
                </div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 text-center"
                >
                    <p className="text-gray-500 dark:text-gray-400 italic">
                        "The strongest people are not those who show strength in front of us but those who win battles we know nothing about."
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default SupportYouth;
