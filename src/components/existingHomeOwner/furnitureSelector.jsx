import { Box, Flex, Heading, Text, Button, Image, Spinner, SimpleGrid, Badge } from "@chakra-ui/react";
import { FaCouch, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ShowToast from "@/Extensions/ShowToast";
import server from "../../../networking";


function FurnitureSelector({ onConfirm, onBack, confirmLabel }) {
    const { user } = useAuth();
    const [furnitureItems, setFurnitureItems] = useState([]);
    const [selectedUrls, setSelectedUrls] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [atMax, setAtMax] = useState(false);

    useEffect(() => {
        const fetchFurniture = async () => {
            if (!user) return;
            try {
                setIsLoading(true);
                setLoadError(null);
                const response = await server.get("/image/getFurniture", {
                    headers: { "X-User-ID": user.uid }
                });

                if (response.data.success && response.data.furniture) {
                    setFurnitureItems(response.data.furniture);
                } else {
                    setLoadError("No recommendations found. You can still generate a design.");
                }
            } catch (err) {
                setLoadError("Failed to load recommendations.");
                if (err?.response?.data?.detail) {
                    if (err.response.data.detail.startsWith("UERROR: ")) {
                        const errorMessage = err.response.data.detail.substring("UERROR: ".length);
                        setLoadError(errorMessage);
                        console.error("[FurnitureSelector] load error: ", errorMessage);
                        ShowToast("error", errorMessage, "Check console for more details.");
                    } else if (err.response.data.detail.startsWith("ERROR: ")) {
                        const errorMessage = err.response.data.detail.substring("ERROR: ".length);
                        setLoadError(errorMessage);
                        console.error("[FurnitureSelector] load error: ", errorMessage);
                        ShowToast("error", errorMessage, "Check console for more details.");
                    } else {
                        console.error("[FurnitureSelector] load error: ", err.response.data.detail);
                        ShowToast("error", "Failed to load recommendations.", "Check console for more details.");
                    }
                } else if (err?.response?.data?.error) {
                    if (err.response.data.error.startsWith("UERROR: ")) {
                        const errorMessage = err.response.data.error.substring("UERROR: ".length);
                        setLoadError(errorMessage);
                        console.error("FurnitureSelector load error: ", errorMessage);
                        ShowToast("error", errorMessage, "Check console for more details.");
                    } else if (err.response.data.error.startsWith("ERROR: ")) {
                        const errorMessage = err.response.data.error.substring("ERROR: ".length);
                        setLoadError(errorMessage);
                        console.error("[FurnitureSelector] load error: ", errorMessage);
                        ShowToast("error", errorMessage, "Check console for more details.");
                    } else {
                        console.error("[FurnitureSelector] load error: ", err.response.data.error);
                        ShowToast("error", "Failed to load recommendations.", "Check console for more details.");
                    }
                } else {
                    console.error("[FurnitureSelector] load error: ", err?.response);
                    ShowToast("error", "An unexpected error occurred", "Check console for more details.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchFurniture();
    }, [user]);

    const toggleSelect = (url) => {
        setSelectedUrls((prev) => {
            if (prev.includes(url)) {
                setAtMax(false);
                return prev.filter((u) => u !== url);
            }
            if (prev.length >= 4) {
                setAtMax(true);
                return prev;
            }
            const next = [...prev, url];
            setAtMax(next.length >= 4);
            return next;
        });
    };

    const handleConfirm = () => {
        const selectedItems = furnitureItems.filter((i) => selectedUrls.includes(i.image_url));
        onConfirm({
            urls: selectedUrls,
            descriptions: selectedItems.map((i) => i.name).filter(Boolean)
        });
    };

    // Group items by name
    const groupedItems = furnitureItems.reduce((groups, item) => {
        const key = item.name || "Other";
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
        return groups;
    }, {});

    if (isLoading) {
        return (
            <Box border="2px solid #D4AF37" borderRadius="12px" p={10} bg="white" boxShadow="md" textAlign="center">
                <Spinner size="xl" color="#D4AF37" thickness="4px" mb={4} />
                <Text color="gray.600" fontSize="lg">Loading your saved recommendations...</Text>
            </Box>
        );
    }

    if (loadError || furnitureItems.length === 0) {
        return (
            <Box border="2px solid #D4AF37" borderRadius="12px" p={8} bg="white" boxShadow="md">
                <Flex align="center" justify="center" gap={3} mb={4}>
                    <FaCouch color="#D4AF37" size={24} />
                    <Heading size="lg" color="#D4AF37">Recommended Items</Heading>
                </Flex>
                <Box bg="yellow.50" border="1px solid" borderColor="yellow.300" borderRadius="md" p={4} mb={6} textAlign="center">
                    <Text color="yellow.700" fontWeight="600">
                        {loadError || "No saved recommendations found. Save some recommendations first!"}
                    </Text>
                    <Text color="gray.600" fontSize="sm" mt={1}>
                        No worries — we'll generate your design based on your selected styles.
                    </Text>
                </Box>
                <Flex gap={4} justify="center">
                    {onBack && (
                        <Button onClick={onBack} variant="outline" borderColor="#D4AF37" color="#D4AF37" px={8} py={6} fontSize="md" fontWeight="600" borderRadius="md"
                            _hover={{ bg: "#FFFDF7" }}>
                            Back
                        </Button>
                    )}
                    <Button onClick={() => onConfirm({ urls: [], descriptions: [] })} bg="#D4AF37" color="white" px={10} py={6} fontSize="md" fontWeight="700" borderRadius="md"
                        rightIcon={<FaArrowRight />}
                        _hover={{ bg: "#C9A961", transform: "translateY(-2px)", boxShadow: "lg" }}
                        transition="all 0.2s">
                        Continue Anyway
                    </Button>
                </Flex>
            </Box>
        );
    }

    return (
        <Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="white" boxShadow="md">
            <Flex align="center" justify="center" gap={3} mb={2}>
                <FaCouch color="#D4AF37" size={24} />
                <Heading size="lg" color="#D4AF37">Select Recommended Items to Include</Heading>
            </Flex>
            <Text textAlign="center" color="gray.600" fontSize="md" mb={6}>
                Choose the recommended pieces you want incorporated into your generated design.
                <br />
                <Text as="span" fontSize="sm" color="gray.500">
                    Select up to 4, or select none to let the AI decide.
                </Text>
            </Text>

            <Box position="sticky" top={0} zIndex={10} bg="white" py={3} mb={5}
                borderBottom="1px solid" borderColor={atMax ? "orange.200" : "#F4E5B2"}
                transition="all 0.2s"
            >
                <Flex justify="center" align="center" gap={3}>
                    <Badge fontSize="sm" px={4} py={2} borderRadius="full"
                        bg={selectedUrls.length > 0 ? "#F4E5B2" : "gray.100"}
                        color={selectedUrls.length > 0 ? "#8B7355" : "gray.500"} border="1px solid"
                        borderColor={selectedUrls.length > 0 ? "#D4AF37" : "gray.200"}
                    >
                        {selectedUrls.length === 0
                            ? "No pieces selected — AI will decide"
                            : `${selectedUrls.length}/4 piece${selectedUrls.length > 1 ? "s" : ""} selected`}
                    </Badge>
                    {atMax && (
                        <Text fontSize="xs" color="orange.500" fontWeight="700">
                            ⚠ Max reached — deselect to swap
                        </Text>
                    )}
                </Flex>
            </Box>

            {/* Grouped items */}
            <Flex direction="column" gap={6} mb={6}>
                {Object.entries(groupedItems).map(([groupName, items]) => (
                    <Box key={groupName}>
                        <Flex align="center" gap={2} mb={3}>
                            <Text fontWeight="700" fontSize="sm" color="#8B7355" textTransform="uppercase" letterSpacing="wide">
                                {groupName}
                            </Text>
                            <Box flex="1" h="1px" bg="#F4E5B2" />
                            <Text fontSize="xs" color="gray.400">{items.length} item{items.length > 1 ? "s" : ""}</Text>
                        </Flex>
                        <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={4}>
                            {items.map((item) => {
                                const isSelected = selectedUrls.includes(item.image_url);
                                return (
                                    <Box key={item.id}
                                        onClick={() => toggleSelect(item.image_url)}
                                        cursor="pointer" borderRadius="10px" border="2px solid"
                                        borderColor={isSelected ? "#D4AF37" : "#E2E8F0"}
                                        bg={isSelected ? "#FFFDF7" : "white"}
                                        boxShadow={isSelected ? "0 0 0 3px rgba(212,175,55,0.25)" : "sm"}
                                        overflow="hidden" transition="all 0.2s" position="relative"
                                        _hover={{ borderColor: "#D4AF37", transform: "translateY(-3px)", boxShadow: "md" }}
                                    >
                                        {isSelected && (
                                            <Box position="absolute" top={2} right={2} zIndex={1}>
                                                <FaCheckCircle color="#D4AF37" size={20} />
                                            </Box>
                                        )}
                                        <Image src={item.image_url} alt={item.name} w="100%" h="130px"
                                            objectFit="cover" bg="gray.50"
                                        />
                                        <Box p={2} textAlign="center">
                                            <Text fontSize="xs" fontWeight="600"
                                                color={isSelected ? "#8B7355" : "gray.500"}
                                                noOfLines={1} lineHeight="1.3"
                                            >
                                                Option {items.indexOf(item) + 1}
                                            </Text>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                    </Box>
                ))}
            </Flex>

            <Flex justify="center" gap={3} mb={6} flexWrap="wrap">
                <Button  size="sm" variant="outline" borderColor="gray.300" color="gray.600"
                    onClick={() => setSelectedUrls(furnitureItems.slice(0, 4).map((i) => i.image_url))}
                    _hover={{ borderColor: "#D4AF37", color: "#D4AF37" }}
                >
                    Select All
                </Button>
                <Button size="sm" variant="outline" borderColor="gray.300" color="gray.600"
                    onClick={() => setSelectedUrls([])}
                    _hover={{ borderColor: "red.300", color: "red.500" }}
                >
                    Clear All
                </Button>
            </Flex>

            <Flex gap={4} justify="center" flexWrap="wrap">
                {onBack && (
                    <Button onClick={onBack} variant="outline" borderColor="#D4AF37" color="#D4AF37"
                        px={8} py={6} fontSize="md" fontWeight="600" borderRadius="md"
                        _hover={{ bg: "#FFFDF7" }}
                        transition="all 0.2s"
                    >
                        Back
                    </Button>
                )}
                <Button onClick={handleConfirm}
                    bg="linear-gradient(135deg, #D4AF37 0%, #C9A961 100%)" color="white"
                    px={12} py={6} fontSize="md" fontWeight="700" borderRadius="md"
                    rightIcon={<FaArrowRight />}
                    _hover={{
                        bg: "linear-gradient(135deg, #C9A961 0%, #B8984D 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "lg"
                    }}
                    transition="all 0.2s"
                >
                    {confirmLabel || (selectedUrls.length > 0 ? "Generate with Selected Items" : "Generate Design")}
                </Button>
            </Flex>
        </Box>
    );
}

export default FurnitureSelector;