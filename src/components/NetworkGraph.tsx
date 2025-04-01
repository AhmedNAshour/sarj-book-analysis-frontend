import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Character, Relationship, GraphData, Node, Link } from '../types';

// Define a type that combines Node with SimulationNodeDatum
type SimNode = Node & d3.SimulationNodeDatum;
type SimLink = d3.SimulationLinkDatum<SimNode> & Link;

interface NetworkGraphProps {
  characters: Character[];
  relationships: Relationship[];
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ characters, relationships }) => {
  // Add early return if props are missing or invalid
  if (!characters || !relationships || !Array.isArray(characters) || !Array.isArray(relationships)) {
    console.warn('NetworkGraph: Missing or invalid props');
    return <div className="w-full h-full flex items-center justify-center">No data available</div>;
  }
  
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  
  // Transform data for D3 and deduplicate relationships for graph display
  const graphData = useMemo<GraphData>(() => {
    // Create nodes from characters
    const nodes: Node[] = characters.map(char => ({
      id: char.name,
      name: char.name,
      value: char.mentions || 1,
      importance: char.importance,
      description: char.description || '',
      aliases: Array.isArray(char.aliases) ? char.aliases : [],
      arcSpan: char.arcSpan,
      appearanceCount: char.appearanceCount,
      presencePattern: char.presencePattern
    }));

    // Create a map to deduplicate relationships
    const connectionMap = new Map<string, Link>();
    
    // Process all relationships, but only keep one connection per character pair
    relationships.forEach(rel => {
      // Create a consistent key for the pair, sorting names to ensure uniqueness
      const pairKey = [rel.source, rel.target].sort().join('->');
      
      // If we already have a relationship for this pair, keep the stronger one
      if (connectionMap.has(pairKey)) {
        const existingRel = connectionMap.get(pairKey)!;
        if (rel.strength > existingRel.value) {
          connectionMap.set(pairKey, {
            source: rel.source,
            target: rel.target,
            value: rel.strength || 1,
            type: rel.type || '',
            description: rel.description || '',
            status: rel.status,
            arcSpan: rel.arcSpan,
            appearanceCount: rel.appearanceCount,
            developmentPattern: rel.developmentPattern
          });
        }
      } else {
        // Add the new relationship
        connectionMap.set(pairKey, {
          source: rel.source,
          target: rel.target,
          value: rel.strength || 1,
          type: rel.type || '',
          description: rel.description || '',
          status: rel.status,
          arcSpan: rel.arcSpan,
          appearanceCount: rel.appearanceCount,
          developmentPattern: rel.developmentPattern
        });
      }
    });
    
    // Convert the map to an array
    const links: Link[] = Array.from(connectionMap.values());

    return { nodes, links };
  }, [characters, relationships]);

  // Get outgoing and incoming relationships for a character
  const getCharacterRelationships = (characterId: string) => {
    const outgoing = relationships.filter(rel => rel.source === characterId);
    const incoming = relationships.filter(rel => rel.target === characterId && rel.source !== characterId);
    return { outgoing, incoming };
  };

  // Reference to keep track of active simulation
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  // Filter connections for selected node
  useEffect(() => {
    if (selectedNode) {
      const connectedNodes = new Set<string>([selectedNode.id]);
      
      relationships.forEach(rel => {
        if (rel.source === selectedNode.id) {
          connectedNodes.add(rel.target);
        } else if (rel.target === selectedNode.id) {
          connectedNodes.add(rel.source);
        }
      });
      
      setHighlightedNodes(connectedNodes);
    } else if (!searchTerm) {
      setHighlightedNodes(new Set<string>());
    }
  }, [selectedNode, relationships, searchTerm]);

  // Filter by search term
  useEffect(() => {
    if (searchTerm) {
      const matchingNodes = new Set<string>();
      
      characters.forEach(char => {
        const nameMatch = char.name.toLowerCase().includes(searchTerm.toLowerCase());
        const aliasMatch = Array.isArray(char.aliases) && char.aliases.some(alias => 
          alias.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (nameMatch || aliasMatch) {
          matchingNodes.add(char.name);
        }
      });
      
      setHighlightedNodes(matchingNodes);
    } else if (!selectedNode) {
      setHighlightedNodes(new Set<string>());
    }
  }, [searchTerm, characters, selectedNode]);

  // Create and update the force graph
  useEffect(() => {
    if (!svgRef.current || !graphData.nodes.length) return;
    
    // Stop any existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Get parent dimensions
    const parentElement = svgRef.current.parentElement;
    if (!parentElement) return;

    const width = parentElement.clientWidth;
    const height = parentElement.clientHeight;
    
    // Clear previous graph
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    svg.attr("width", width)
       .attr("height", height)
       .attr("viewBox", `0 0 ${width} ${height}`);
    
    // Create a container for visualization
    const g = svg.append('g');
    
    // Color scale for node importance
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['major', 'supporting', 'minor'])
      .range(['#3b82f6', '#60a5fa', '#93c5fd']);
    
    // Create the links first (so they appear behind nodes)
    const link = g.append('g')
      .selectAll('line')
      .data(graphData.links)
      .enter()
      .append('line')
      .attr('stroke-width', d => Math.max(Math.sqrt(d.value), 1))
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.6);
    
    // Create the simulation first before using it
    const simulation = d3.forceSimulation<SimNode>(graphData.nodes as SimNode[])
      .force('link', d3.forceLink<SimNode, SimLink>(graphData.links as SimLink[])
        .id(d => d.id)
        .distance(100)
        .strength(0.8))
      .force('charge', d3.forceManyBody<SimNode>().strength(-300))
      .force('center', d3.forceCenter<SimNode>(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>().radius(d => Math.sqrt(d.value) * 2 + 12));
    
    // Store simulation reference
    simulationRef.current = simulation;
    
    // Create the nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(graphData.nodes)
      .enter()
      .append('circle')
      .attr('r', d => Math.sqrt(d.value) * 2 + 6)
      .attr('fill', d => colorScale(d.importance))
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1.5)
      .on('click', (event, d) => {
        setSelectedNode(prev => prev && prev.id === d.id ? null : d);
      });
      
    // Add node drag behavior
    const drag = (simulation: d3.Simulation<SimNode, SimLink>) => {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag<any, SimNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    };
    
    // Now use the simulation in the drag function
    node.call(drag(simulation) as any);
    
    // Add labels for major and supporting characters
    const labels = g.append('g')
      .selectAll('text')
      .data(graphData.nodes.filter(n => n.importance !== 'minor'))
      .enter()
      .append('text')
      .text(d => d.name)
      .attr('font-size', '10px')
      .attr('dx', d => Math.sqrt(d.value) * 2 + 8)
      .attr('dy', 4)
      .attr('fill', '#1e293b');
    
    // Update positions on each tick of the simulation
    simulation.on('tick', () => {
      // Boundary constraint to keep nodes inside the SVG
      const padding = 30;
      
      graphData.nodes.forEach(d => {
        // d has x/y properties from SimulationNodeDatum
        const simNode = d as SimNode;
        if (simNode.x) simNode.x = Math.max(padding, Math.min(width - padding, simNode.x));
        if (simNode.y) simNode.y = Math.max(padding, Math.min(height - padding, simNode.y));
      });
      
      // Update node positions
      node
        .attr('cx', d => (d as SimNode).x ?? 0)
        .attr('cy', d => (d as SimNode).y ?? 0);
      
      // Update link positions - handle both D3's object references and string IDs
      link
        .attr('x1', d => {
          const source = d.source as any;
          // Check if source is an object and has x property
          return typeof source === 'object' && source !== null && 'x' in source ? source.x : 0;
        })
        .attr('y1', d => {
          const source = d.source as any;
          // Check if source is an object and has y property
          return typeof source === 'object' && source !== null && 'y' in source ? source.y : 0;
        })
        .attr('x2', d => {
          const target = d.target as any;
          // Check if target is an object and has x property
          return typeof target === 'object' && target !== null && 'x' in target ? target.x : 0;
        })
        .attr('y2', d => {
          const target = d.target as any;
          // Check if target is an object and has y property
          return typeof target === 'object' && target !== null && 'y' in target ? target.y : 0;
        });
      
      // Update label positions
      labels
        .attr('x', d => (d as SimNode).x ?? 0)
        .attr('y', d => (d as SimNode).y ?? 0);
    });
    
    // Apply visual effects based on selection state
    const updateHighlighting = () => {
      const isHighlighted = (id: string) => highlightedNodes.size === 0 || highlightedNodes.has(id);
      
      // Highlight/dim nodes
      node.attr('opacity', d => isHighlighted(d.id) ? 1 : 0.3);
      
      // Highlight/dim links
      link.attr('opacity', d => {
        // D3 transforms string IDs into node objects during simulation
        const source = d.source as (SimNode | string);
        const target = d.target as (SimNode | string);
        
        // Extract IDs safely from either object references or string IDs
        const sourceId = typeof source === 'object' && source !== null ? source.id : source;
        const targetId = typeof target === 'object' && target !== null ? target.id : target;
        
        return (isHighlighted(sourceId as string) && isHighlighted(targetId as string)) ? 0.6 : 0.1;
      });
      
      // Highlight/dim labels
      labels.attr('opacity', d => isHighlighted(d.id) ? 1 : 0.3);
    };
    
    // Initial highlight update
    updateHighlighting();
    
    // Return a cleanup function
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [graphData, highlightedNodes]);

  // Apply highlighting when selection changes
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const isHighlighted = (id: string) => highlightedNodes.size === 0 || highlightedNodes.has(id);
    
    // Update nodes
    svg.selectAll('circle')
      .attr('opacity', d => isHighlighted((d as Node).id) ? 1 : 0.3)
      .attr('stroke', d => selectedNode && (d as Node).id === selectedNode.id ? '#f97316' : '#1e293b')
      .attr('stroke-width', d => selectedNode && (d as Node).id === selectedNode.id ? 3 : 1.5);
    
    // Update links
    svg.selectAll('line')
      .attr('opacity', d => {
        const link = d as any;
        // Use safer type checking
        const source = link.source as (SimNode | string | { id: string });
        const target = link.target as (SimNode | string | { id: string });
        
        // Safely extract the ID regardless of what form source/target take
        const sourceId = typeof source === 'object' && source !== null ? 
          ('id' in source ? source.id : '') : source;
        const targetId = typeof target === 'object' && target !== null ? 
          ('id' in target ? target.id : '') : target;
        
        return (isHighlighted(sourceId as string) && isHighlighted(targetId as string)) ? 0.6 : 0.1;
      });
    
    // Update labels
    svg.selectAll('text')
      .attr('opacity', d => isHighlighted((d as Node).id) ? 1 : 0.3);
    
  }, [highlightedNodes, selectedNode]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!svgRef.current || !simulationRef.current) return;
      
      const parentElement = svgRef.current.parentElement;
      if (!parentElement) return;
      
      const width = parentElement.clientWidth;
      const height = parentElement.clientHeight;
      
      d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`);
      
      simulationRef.current
        .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1))
        .alpha(0.3)
        .restart();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full flex flex-col" style={{ minHeight: '80vh' }}>
      <div className="flex flex-col lg:flex-row gap-4 h-full flex-grow">
        <div className="lg:w-3/4 h-full min-h-[600px] flex-grow">
          {/* Search bar moved to top of container instead of overlaying the graph */}
          <div className="mb-2 flex justify-between items-center">
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search characters..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white shadow-sm border border-gray-200"
              />
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="font-medium">{graphData.nodes.length}</span> characters, 
              <span className="font-medium">{graphData.links.length}</span> connections
            </div>
          </div>
          
          <div className="w-full h-full bg-white rounded-md border border-gray-200 overflow-hidden relative" style={{ minHeight: '600px' }}>
            {/* Graph container with proper padding to avoid nodes being cut off */}
            <svg ref={svgRef} width="100%" height="100%" className="p-2" />
          </div>
        </div>
        <div className="lg:w-1/4 h-full overflow-auto">
          {selectedNode ? (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold">{selectedNode.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="capitalize">{selectedNode.importance}</Badge>
                    <Badge variant="secondary">{selectedNode.value} Mentions</Badge>
                  </div>
                  
                  {selectedNode.aliases && selectedNode.aliases.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold text-gray-500">Also known as:</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedNode.aliases.map(alias => (
                          <Badge key={alias} variant="outline" className="text-gray-500">{alias}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Character Description:</h4>
                  <p className="text-sm mt-1">{selectedNode.description}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {selectedNode.arcSpan !== undefined && (
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{selectedNode.arcSpan}</div>
                      <div className="text-xs text-gray-500">Arc Span</div>
                    </div>
                  )}
                  
                  {selectedNode.appearanceCount !== undefined && (
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{selectedNode.appearanceCount}</div>
                      <div className="text-xs text-gray-500">Appearances</div>
                    </div>
                  )}
                  
                  {selectedNode.presencePattern && (
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium text-xs capitalize">{selectedNode.presencePattern}</div>
                      <div className="text-xs text-gray-500">Presence</div>
                    </div>
                  )}
                </div>
                
                {/* Updated Connections section to show both directions */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">How {selectedNode.name} views others:</h4>
                  <div className="mt-1 max-h-[150px] overflow-y-auto space-y-1">
                    {relationships
                      .filter(rel => rel.source === selectedNode.id)
                      .sort((a, b) => b.strength - a.strength)
                      .map((rel, idx) => {
                        const simplifiedType = rel.type.split('-').length === 2 ? 
                          rel.type.split('-')[0] : rel.type;
                        
                        return (
                          <div key={`outgoing-${idx}`} className="flex flex-col py-2 px-2 rounded-md hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{rel.target}</span>
                              {rel.status && (
                                <span className="text-xs text-gray-500">{rel.status.split(',')[0]}</span>
                              )}
                            </div>
                            <div className="mt-1">
                              <Badge 
                                variant="outline"
                                className="text-xs whitespace-normal break-words"
                                style={{
                                  backgroundColor: `rgba(124, 58, 237, ${rel.strength / 20 + 0.1})`
                                }}
                              >
                                {simplifiedType} (Strength: {rel.strength})
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500">How others view {selectedNode.name}:</h4>
                  <div className="mt-1 max-h-[150px] overflow-y-auto space-y-1">
                    {relationships
                      .filter(rel => rel.target === selectedNode.id)
                      .sort((a, b) => b.strength - a.strength)
                      .map((rel, idx) => {
                        const simplifiedType = rel.type.split('-').length === 2 ? 
                          rel.type.split('-')[1] : rel.type;
                        
                        return (
                          <div key={`incoming-${idx}`} className="flex flex-col py-2 px-2 rounded-md hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{rel.source}</span>
                              {rel.status && (
                                <span className="text-xs text-gray-500">{rel.status.split(',')[0]}</span>
                              )}
                            </div>
                            <div className="mt-1">
                              <Badge 
                                variant="outline"
                                className="text-xs whitespace-normal break-words"
                                style={{
                                  backgroundColor: `rgba(124, 58, 237, ${rel.strength / 20 + 0.1})`
                                }}
                              >
                                {simplifiedType} (Strength: {rel.strength})
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500">Click on a character to view their details</p>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Legend:</h4>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                    <span className="text-sm">Major Character</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-[#60a5fa]"></div>
                    <span className="text-sm">Supporting Character</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#93c5fd]"></div>
                    <span className="text-sm">Minor Character</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm">
                    • Node size indicates number of mentions<br />
                    • Edge thickness shows relationship strength<br />
                    • Click a character to see connections<br />
                    • Drag nodes to rearrange the network
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;