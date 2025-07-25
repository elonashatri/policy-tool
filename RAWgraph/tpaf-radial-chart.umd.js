(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.tpafRadialChart = {}));
}(this, (function (exports) {
  'use strict';

  // Main chart function
  function draw(container, data, options, styles) {
    // Dimensions
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const margin = 40;

    // Clear previous SVG
    d3.select(container).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Color scales
    const colorVariations = {
      'infrastructure': ['#a8c6fa', '#6a9ceb', '#3a72c2', '#20508e'],
      'legislation': ['#fde6a8', '#fbd575', '#f5b745', '#efae42'],
      'sustainability': ['#d9b5ff', '#c387fa', '#a55aee', '#8724d3'],
      'economic': ['#ffa3a3', '#f87373', '#e54e4e', '#cf3535'],
      'education': ['#8fc9a8', '#5eaa7f', '#3a7d54', '#255a34']
    };

    // Process data into hierarchy
    const root = d3.stratify()
      .id(d => d.policy_option)
      .parentId(d => d.phase ? `${d.dimension}-${d.phase}` : d.dimension)(data);

    // Add synthetic root if needed
    if (root.children.length > 1) {
      const newRoot = {id: "root", children: root.children};
      root.children = [newRoot];
    }

    // Radial layout
    const radius = Math.min(width, height) / 2 - margin;
    const treeLayout = d3.tree()
      .size([2 * Math.PI, radius])
      .separation((a, b) => 1);

    const treeData = treeLayout(root);

    // Draw links
    svg.append('g')
      .selectAll('path')
      .data(treeData.links())
      .join('path')
      .attr('d', d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y)
      )
      .attr('fill', 'none')
      .attr('stroke', '#ddd')
      .attr('stroke-width', 1.5);

    // Draw nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(treeData.descendants())
      .join('g')
      .attr('transform', d => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
      `);

    // Add circles for policies
    node.filter(d => d.depth === 3)
      .append('circle')
      .attr('r', 5)
      .attr('fill', d => {
        const dim = d.data.dimension.toLowerCase();
        const phaseOrder = ['analyse', 'design', 'implementation', 'monitoring'].indexOf(
          d.data.phase.split(' ')[0].toLowerCase()
        );
        return colorVariations[dim][phaseOrder] || '#ccc';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Add dimension arcs
    const dimensions = [...new Set(data.map(d => d.dimension))];
    dimensions.forEach((dim, i) => {
      const startAngle = (i / dimensions.length) * 2 * Math.PI;
      const endAngle = ((i + 1) / dimensions.length) * 2 * Math.PI;
      
      svg.append('path')
        .attr('d', d3.arc()
          .innerRadius(radius * 0.7)
          .outerRadius(radius + 10)
          .startAngle(startAngle)
          .endAngle(endAngle)
          .padAngle(0.02)
        )
        .attr('fill', colorVariations[dim.toLowerCase()][0])
        .attr('opacity', 0.1)
        .attr('transform', `translate(${centerX},${centerY})`);
    });

    // Add labels
    node.filter(d => d.depth === 1)
      .append('text')
      .attr('dy', '0.31em')
      .attr('x', d => d.x < Math.PI ? 6 : -6)
      .attr('text-anchor', d => d.x < Math.PI ? 'start' : 'end')
      .attr('transform', d => d.x >= Math.PI ? 'rotate(180)' : null)
      .text(d => d.data.id.replace('-', ' '))
      .attr('font-size', '11px')
      .attr('fill', '#555');
  }

  // RAWGraphs required exports
  exports.draw = draw;
  exports.meta = {
    label: 'TPAF Policy Radial Chart',
    id: 'tpafRadialChart',
    options: {
      // Add customizable options here
      showConnections: {
        type: 'boolean',
        label: 'Show policy connections',
        default: false
      }
    },
    data: {
      // Define expected data structure
      path: 'auto',
      fields: [
        { name: 'dimension', type: 'string', required: true },
        { name: 'phase', type: 'string', required: true },
        { name: 'policy_option', type: 'string', required: true },
        { name: 'details_actions', type: 'string' },
        { name: 'examples', type: 'string' }
      ]
    }
  };
})));