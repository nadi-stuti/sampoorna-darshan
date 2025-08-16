import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

type FeedbackFormProps = {
    visible: boolean;
    onClose: () => void;
};

export const FeedbackForm = ({ visible, onClose }: FeedbackFormProps) => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!user || !feedback.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('user_requests')
                .insert([
                    {
                        user_id: user.id,
                        request: feedback.trim(),
                    }
                ]);

            if (error) throw error;
            onClose();
            setFeedback('');
            Toast.show({
                text1: t('feedback.success'),
                type: 'success',
            });
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <Modal visible={visible} onClose={onClose}>
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        {t('feedback.loginRequired')}
                    </Text>
                    <Text style={[styles.description, { color: theme.colors.text }]}>
                        {t('feedback.loginToSubmit')}
                    </Text>
                    <Button
                        title={t('auth.signIn')}
                        onPress={() => {
                            onClose();
                            router.push('/(tabs)/profile');
                        }}
                    />
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} onClose={onClose}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    {t('feedback.title')}
                </Text>
                <Text style={[styles.description, { color: theme.colors.text }]}>
                    {t('feedback.description')}
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: theme.colors.card,
                            color: theme.colors.text,
                            borderColor: theme.colors.border
                        }
                    ]}
                    multiline
                    numberOfLines={6}
                    placeholder={t('feedback.placeholder')}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={feedback}
                    onChangeText={setFeedback}
                />
                <View style={styles.buttonContainer}>
                    <Button
                        title={t('common.cancel')}
                        variant="outline"
                        onPress={onClose}
                        style={styles.button}
                    />
                    <Button
                        title={t('feedback.submit')}
                        onPress={handleSubmit}
                        loading={isSubmitting}
                        disabled={!feedback.trim() || isSubmitting}
                        style={styles.button}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        maxHeight: '80%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        marginBottom: 20,
    },
    scrollView: {
        flex: 1,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        textAlignVertical: 'top',
        ...Platform.select({
            ios: {
                minHeight: 120,
            },
            android: {
                minHeight: 120,
            },
        }),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    button: {
        flex: 1,
    },
}); 