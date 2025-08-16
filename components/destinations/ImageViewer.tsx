import { DestinationImages } from "@/lib/map";
import { Animated, Modal, StyleSheet, useWindowDimensions } from "react-native";

import Feather from "@expo/vector-icons/Feather";
import React, { useRef, useState } from "react";
import {
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View
} from "react-native";

// Add new component at the top of the file
export const ImageViewer = ({
    visible,
    onClose,
    images,
    initialIndex,
    theme
}: {
    visible: boolean;
    onClose: () => void;
    images: { hero_image: string; image_description: string | null }[];
    initialIndex: number;
    theme: any;
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const pan = useRef(new Animated.ValueXY()).current;


    const { width } = useWindowDimensions();

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={[styles.modalContainer, { backgroundColor: "rgba(0, 0, 0, 0.8)" }]} >
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            transform: [
                                { translateX: pan.x },
                                { translateY: pan.y },
                            ],
                        },
                    ]}
                >
                    <FlatList
                        data={images}
                        horizontal
                        pagingEnabled
                        // initialScrollIndex={initialIndex}
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
                            setCurrentIndex(newIndex);
                        }}
                        renderItem={({ item }) => (
                            <View style={[styles.modalImageContainer, { width }]}>
                                <Image
                                    source={{ uri: item.hero_image }}
                                    style={styles.modalImage}
                                    resizeMode="contain"
                                />
                                {item.image_description && (
                                    <Text style={[styles.imageDescription, { color: 'white' }]}>
                                        {item.image_description}
                                    </Text>
                                )}
                            </View>
                        )}
                    />
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
                        onPress={onClose}
                    >
                        <Feather name="x" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.paginationContainer}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.paginationDot,
                                    {
                                        backgroundColor: index === currentIndex ? "white" : "rgba(255, 255, 255, 0.5)",
                                    },
                                ]}
                            />
                        ))}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    // ... existing styles ...
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        flex: 1,
        width: '100%',
    },
    modalImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalImage: {
        width: '100%',
        height: '80%',
    },
    imageDescription: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        right: 20,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 8,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
});