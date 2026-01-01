import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';

interface InteractiveFormSectionProps {
  userRole: string;
}

interface FormData {
  name: string;
  email: string;
  message: string;
  priority: 'standard' | 'urgent' | 'vip';
}

interface ValidationState {
  name: boolean;
  email: boolean;
  message: boolean;
}

export const InteractiveFormSection: React.FC<InteractiveFormSectionProps> = ({
  userRole
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
    priority: 'standard'
  });

  const [validation, setValidation] = useState<ValidationState>({
    name: true,
    email: true,
    message: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiValidation, setAiValidation] = useState({
    isThinking: false,
    suggestions: [] as string[],
    isValid: true
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Memoized priority options for performance
  const priorityOptions = useMemo(() => [
    { value: 'standard', label: 'Standard', color: 'from-blue-400 to-blue-600', icon: '📧' },
    { value: 'urgent', label: 'Urgent', color: 'from-orange-400 to-orange-600', icon: '⚡' },
    { value: 'vip', label: 'VIP', color: 'from-yellow-400 to-yellow-600', icon: '👑' }
  ], []);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Optimized AI Validation Logic
  useEffect(() => {
    if (!isInView) return;

    const validateField = async () => {
      if (formData.email && !validation.email) {
        setAiValidation({
          isThinking: true,
          suggestions: [],
          isValid: false
        });

        // Simulate AI validation with reduced delay
        setTimeout(() => {
          setAiValidation({
            isThinking: false,
            suggestions: ['Please check your email format', 'Ensure domain is valid'],
            isValid: false
          });
        }, 1000);
      } else if (formData.message && formData.message.length < 10) {
        setAiValidation({
          isThinking: true,
          suggestions: [],
          isValid: false
        });

        setTimeout(() => {
          setAiValidation({
            isThinking: false,
            suggestions: ['Tell us more, we\'re listening.', 'Provide additional context for better assistance'],
            isValid: false
          });
        }, 800);
      } else {
        setAiValidation({
          isThinking: false,
          suggestions: [],
          isValid: true
        });
      }
    };

    validateField();
  }, [formData.email, formData.message, validation.email, isInView]);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    if (field === 'email') {
      setValidation(prev => ({ ...prev, email: validateEmail(value) }));
    } else if (field === 'name') {
      setValidation(prev => ({ ...prev, name: value.length >= 2 }));
    } else if (field === 'message') {
      setValidation(prev => ({ ...prev, message: value.length >= 10 }));
    }
  }, [validateEmail]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission with reduced delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Success animation
    setIsSubmitting(false);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      message: '',
      priority: 'standard'
    });
  }, []);

  const generateParticles = useCallback(() => {
    return [...Array(isMobile ? 8 : 15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-yellow-400 rounded-full"
        initial={{
          x: Math.random() * 400 - 200,
          y: Math.random() * 400 - 200,
          scale: 0,
          opacity: 0
        }}
        animate={{
          x: Math.random() * 800 - 400,
          y: Math.random() * 800 - 400,
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 1.5,
          delay: Math.random() * 0.5,
          ease: "easeOut"
        }}
      />
    ));
  }, [isMobile]);

  const isFormValid = useMemo(() => 
    validation.name && validation.email && validation.message && formData.name && formData.email && formData.message,
    [validation, formData]
  );

  return (
    <section 
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 bg-gradient-to-b from-[#1C2A39] to-[#0A0A0A]"
      role="region"
      aria-label="Contact Form"
    >
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Send a Secure Message
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Our AI assistant validates your message in real-time, ensuring you get the fastest possible response.
          </p>
        </motion.div>

        {/* Enhanced Floating Glass Card Form */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-12 border border-white/20 shadow-2xl">
            {/* Enhanced Background Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent rounded-3xl" />
            
            {/* Enhanced Form Content */}
            <form onSubmit={handleSubmit} className="relative z-10 space-y-6 sm:space-y-8">
              {/* Enhanced Priority Selector */}
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
                {priorityOptions.map((priority) => (
                  <motion.button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                    className={`
                      relative px-4 sm:px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2
                      ${formData.priority === priority.value 
                        ? `bg-gradient-to-r ${priority.color} text-white shadow-lg scale-105` 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Select ${priority.label} priority`}
                    aria-pressed={formData.priority === priority.value}
                  >
                    <span className="text-sm sm:text-base">{priority.icon}</span>
                    <span className="text-sm sm:text-base">{priority.label}</span>
                    {formData.priority === priority.value && (
                      <motion.div
                        layoutId="priority-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Enhanced Name Field */}
              <div className="relative">
                <motion.div
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                    focusedField === 'name' 
                      ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/50' 
                      : 'bg-white/5 border border-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent px-4 sm:px-6 py-4 text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base"
                    aria-label="Your name"
                    aria-invalid={!validation.name && formData.name ? 'true' : 'false'}
                    aria-describedby={!validation.name && formData.name ? 'name-error' : undefined}
                  />
                  {focusedField === 'name' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </motion.div>
                {!validation.name && formData.name && (
                  <motion.p
                    id="name-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-2 ml-2"
                    role="alert"
                  >
                    Name must be at least 2 characters
                  </motion.p>
                )}
              </div>

              {/* Enhanced Email Field */}
              <div className="relative">
                <motion.div
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                    focusedField === 'email' 
                      ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/50' 
                      : 'bg-white/5 border border-white/10'
                  } ${!validation.email && formData.email ? 'border-red-400/50' : ''}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent px-4 sm:px-6 py-4 text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base"
                    aria-label="Your email address"
                    aria-invalid={!validation.email && formData.email ? 'true' : 'false'}
                    aria-describedby={!validation.email && formData.email ? 'email-error' : undefined}
                  />
                  {focusedField === 'email' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </motion.div>
                {!validation.email && formData.email && (
                  <motion.p
                    id="email-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-2 ml-2"
                    role="alert"
                  >
                    Please enter a valid email address
                  </motion.p>
                )}
              </div>

              {/* Enhanced Message Field */}
              <div className="relative">
                <motion.div
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                    focusedField === 'message' 
                      ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/50' 
                      : 'bg-white/5 border border-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    rows={5}
                    className="w-full bg-transparent px-4 sm:px-6 py-4 text-white placeholder-gray-400 focus:outline-none resize-none text-sm sm:text-base"
                    aria-label="Your message"
                    aria-invalid={!validation.message && formData.message ? 'true' : 'false'}
                    aria-describedby={!validation.message && formData.message ? 'message-error' : undefined}
                  />
                  {focusedField === 'message' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </motion.div>
                {!validation.message && formData.message && (
                  <motion.p
                    id="message-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-2 ml-2"
                    role="alert"
                  >
                    Message must be at least 10 characters
                  </motion.p>
                )}
              </div>

              {/* Enhanced AI Validation Assistant */}
              <AnimatePresence>
                {aiValidation.isThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center gap-3 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30"
                    role="status"
                    aria-label="AI is validating your message"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"
                      aria-hidden="true"
                    />
                    <span className="text-blue-300 text-sm sm:text-base">AI is validating your message...</span>
                  </motion.div>
                )}

                {aiValidation.suggestions.length > 0 && !aiValidation.isValid && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 bg-red-500/20 rounded-xl border border-red-400/30"
                    role="alert"
                    aria-label="AI suggestions for improving your message"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">!</span>
                      </div>
                      <span className="text-red-300 font-semibold text-sm sm:text-base">AI Suggestions</span>
                    </div>
                    <ul className="space-y-1">
                      {aiValidation.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-red-200 text-sm ml-9">
                          • {suggestion}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`
                  relative w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300
                  ${isSubmitting || !isFormValid
                    ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700'
                  }
                `}
                whileHover={!isSubmitting && isFormValid ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting && isFormValid ? { scale: 0.98 } : {}}
                onClick={() => {
                  if (!isSubmitting && isFormValid) {
                    // Trigger particle burst
                    generateParticles();
                  }
                }}
                aria-label={isSubmitting ? "Sending message..." : "Send secure message"}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      aria-hidden="true"
                    />
                    <span>Sending Message...</span>
                  </div>
                ) : (
                  'Send Secure Message'
                )}
              </motion.button>
            </form>
          </div>

          {/* Enhanced Particle Burst Container */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <AnimatePresence>
              {isSubmitting && generateParticles()}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

