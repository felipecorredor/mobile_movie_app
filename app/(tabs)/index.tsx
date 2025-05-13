import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import usePaginatedFetch from "@/services/usePaginatedFetch";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies);

  const {
    data: movies,
    loading: moviesLoading,
    loadingMore,
    error: moviesError,
    loadMore,
  } = usePaginatedFetch<Movie>((page) => fetchMovies({ query: "", page }));

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full h-full" />

      {(moviesLoading || trendingLoading) && (
        <View className="flex-1 justify-center items-center px-4">
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"
          />
        </View>
      )}

      {(moviesError || trendingError) && (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-500 text-center">
            Error: {moviesError?.message || trendingError?.message}
          </Text>
        </View>
      )}

      {!moviesLoading && !trendingLoading && !moviesError && !trendingError && (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <MovieCard {...item} />}
          numColumns={3}
          initialNumToRender={10} // Cuántos ítems renderizar inicialmente
          maxToRenderPerBatch={10} // Cuántos ítems por lote
          windowSize={5} // Cuántas pantallas hacia adelante/atrás mantener en memoria
          removeClippedSubviews={true} // Elimina los elementos fuera del viewport (en Android)
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="white" />
            ) : null
          }
          columnWrapperStyle={{
            justifyContent: "flex-start",
            gap: 20,
            paddingRight: 5,
            marginBottom: 10,
          }}
          contentContainerStyle={{
            paddingBottom: 80,
            paddingHorizontal: 20,
            paddingTop: 60,
            minHeight: "100%",
          }}
          ListHeaderComponent={
            <View>
              <Image source={icons.logo} className="w-12 h-10 mb-5 mx-auto" />

              <SearchBar
                onPress={() => router.push("/search")}
                placeholder="Search for a movie"
              />

              <Text className="text-lg text-white font-bold mt-10 mb-3">
                Trending Movies
              </Text>

              <FlatList
                data={trendingMovies}
                keyExtractor={(item) => item.movie_id.toString()}
                renderItem={({ item, index }) => (
                  <TrendingCard movie={item} index={index} />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="w-4" />}
                contentContainerStyle={{ paddingRight: 5, gap: 10 }}
              />

              <Text className="text-lg text-white font-bold mt-10 mb-3">
                Latest Movies
              </Text>
            </View>
          }
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400">No movies found</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
