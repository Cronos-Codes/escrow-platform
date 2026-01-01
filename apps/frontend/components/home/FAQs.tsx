import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';
import * as d3 from 'd3';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FAQNode {
  id: string;
  question: string;
  answer: string;
  children?: FAQNode[];
}

const faqTree: FAQNode = {
  id: 'root',
  question: 'Gold Escrow Platform',
  answer: '',
  children: [
    {
      id: 'licensing',
      question: 'Is Gold Escrow a licensed legal entity?',
      answer: 'Yes. Gold Escrow is licensed and regulated under UAE BAR, AML/KYC, and ISO 27001 standards.',
      children: [
        {
          id: 'licensing-uae',
          question: 'What is UAE BAR licensing?',
          answer: 'UAE BAR licensing ensures we operate under strict legal and ethical standards for escrow services.',
        },
        {
          id: 'licensing-iso',
          question: 'What does ISO 27001 mean?',
          answer: 'ISO 27001 certification demonstrates our commitment to information security management.',
        },
      ],
    },
    {
      id: 'default',
      question: 'What if a party defaults?',
      answer: 'Funds are only released when all contractual obligations are met. In case of default, dispute resolution is handled by our legal team and, if necessary, escalated to arbitration.',
      children: [
        {
          id: 'default-dispute',
          question: 'How is dispute resolution handled?',
          answer: 'Our legal team reviews all disputes according to the escrow agreement terms, with arbitration as a final step if needed.',
        },
      ],
    },
    {
      id: 'currency',
      question: 'Can escrow hold in multi-currency?',
      answer: 'Yes. We support multi-currency escrow, subject to compliance and regulatory checks.',
    },
  ],
};

const FAQs = () => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<FAQNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [searchQuery, setSearchQuery] = useState('');

  // Build tree visualization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || device.isMobile || !animationConfig.enableAnimations) {
      return;
    }

    const width = containerRef.current.offsetWidth;
    const height = 600;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const tree = d3.tree<FAQNode>()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    const root = d3.hierarchy(faqTree);
    tree(root);

    // Links
    const links = g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<d3.HierarchyPointLink<FAQNode>, d3.HierarchyPointNode<FAQNode>>()
        .x(d => d.y)
        .y(d => d.x))
      .attr('fill', 'none')
      .attr('stroke', '#D4AF37')
      .attr('stroke-width', 2)
      .attr('opacity', 0.3)
      .style('stroke-dasharray', function () {
        const length = this.getTotalLength();
        return `${length} ${length}`;
      })
      .attr('stroke-dashoffset', function () {
        return this.getTotalLength();
      });

    // Animate links
    links.transition()
      .duration(1000)
      .attr('stroke-dashoffset', 0);

    // Nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d.data);
        if (d.data.children) {
          setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(d.data.id)) {
              next.delete(d.data.id);
            } else {
              next.add(d.data.id);
            }
            return next;
          });
        }
      });

    // Node circles
    nodes.append('circle')
      .attr('r', 8)
      .attr('fill', d => d.data.children ? '#D4AF37' : '#6b7280')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.5))');

    // Node labels
    nodes.append('text')
      .attr('dy', '.35em')
      .attr('x', d => d.children ? -13 : 13)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .style('font-size', '12px')
      .style('fill', '#fff')
      .text(d => {
        const text = d.data.question.length > 30
          ? d.data.question.substring(0, 30) + '...'
          : d.data.question;
        return text;
      });

    // Animate nodes
    nodes.style('opacity', 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 100)
      .style('opacity', 1);

    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
    };
  }, [device.isMobile, animationConfig.enableAnimations, expandedNodes]);

  // Mobile: Simple accordion
  const renderMobileAccordion = (node: FAQNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div key={node.id} className="mb-2" style={{ marginLeft: `${level * 16}px` }}>
        <button
          onClick={() => {
            if (hasChildren) {
              setExpandedNodes(prev => {
                const next = new Set(prev);
                if (next.has(node.id)) {
                  next.delete(node.id);
                } else {
                  next.add(node.id);
                }
                return next;
              });
            } else {
              setSelectedNode(node);
            }
          }}
          className="w-full text-left p-4 glass-premium transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold text-sm">{node.question}</span>
            {hasChildren && (
              <span className="text-[#D4AF37]">{isExpanded ? '−' : '+'}</span>
            )}
          </div>
        </button>
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {node.children?.map(child => renderMobileAccordion(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
        {selectedNode?.id === node.id && node.answer && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-4 bg-[#D4AF37]/20 rounded-lg border border-[#D4AF37]/30"
          >
            <p className="text-gray-300 text-sm">{node.answer}</p>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <section className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 20 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className={`${device.isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl md:text-4xl'} font-serif font-bold mb-3 sm:mb-4 text-white px-4`}>
            Frequently Asked Questions
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explore our expertise through an interactive knowledge tree
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 10 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true }}
          className="max-w-md mx-auto mb-8"
        >
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-white/10 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none bg-white/5 text-white placeholder-gray-400 glass-premium"
          />
        </motion.div>

        {/* Desktop: Interactive Tree */}
        {!device.isMobile ? (
          <div className="flex gap-8">
            <div
              ref={containerRef}
              className="flex-1 glass-premium rounded-xl p-8 overflow-auto"
              style={{ minHeight: '600px' }}
            >
              <svg ref={svgRef} className="w-full h-full" />
            </div>

            {/* Answer panel */}
            <AnimatePresence>
              {selectedNode && selectedNode.answer && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-96 glass-premium rounded-xl p-6 shadow-lg"
                >
                  <h3 className="text-xl font-bold text-white mb-4">
                    {selectedNode.question}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedNode.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Mobile: Accordion */
          <div className="max-w-2xl mx-auto">
            {renderMobileAccordion(faqTree)}
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQs;
