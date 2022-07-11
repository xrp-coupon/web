import { useEffect, useState, useContext } from "react";
import {
		Box,
		Flex,
		Stack,
		Heading,
		Text,
		Container,
		Input,
		Button,
		SimpleGrid,
		useBreakpointValue,
		FormControl,
		FormLabel,
		Icon,
		StackDivider,
		useColorModeValue,
		Image,
		useDisclosure,
		chakra,
		toast,
		useToast,
		Avatar,
		AvatarGroup,
		SkeletonText,
		SkeletonCircle,
		Skeleton,
		VStack,
		Divider,
		AvatarBadge,
		ButtonGroup
} from '@chakra-ui/react';
import { useParams, useNavigate } from "react-router-dom";
import {
		IoClose,
		IoAddOutline,
		IoCloseCircleOutline,
	} from 'react-icons/io5';
import {ResourcePicker} from '@shopify/app-bridge-react';
import NavBar from "../../components/navbar";

import useFilesStore from "../../store/files"; 
import useScriptsStore from "../../store/scripts";

import Upload from "../../components/upload";
import useLooksStore from "../../store/looks"
import { INTERNAL_SERVER_ERROR } from '../../constants/strings';
import { ShopContext } from "../../context";

const renderSkeleton = () => {
	return (
		<Flex direction="column" width="100%">
			<Skeleton width="100%" height="40px"> </Skeleton>
			<SkeletonText mt='4' noOfLines={1} spacing='4' />
			<br />
			<br />
			<Box >
				<SkeletonCircle size='20' />
				<SkeletonText mt='4' noOfLines={4} spacing='4' />
			</Box>
		</Flex>
	)
}

	
function CreateLooks(props) {
	const shop = useContext(ShopContext);
	const { isOpen, onOpen, onClose } = useDisclosure()
	const { isOpen: isResourcePickerOpen, onOpen: onResourcePickerOpen, onClose: onResourcePickerClose } = useDisclosure()
	const looks = useLooksStore((state) => state.looks);
	const files = useFilesStore((state) => state.files);
	const getLooks = useLooksStore((state) => state.getLooks);
	const postLooks = useLooksStore((state) => state.postLooks);
	const destroyLooks = useLooksStore((state) => state.destroyLooks);
	const patchLooks = useLooksStore((state) => state.patchLooks);
	const scripts = useScriptsStore((state) => state.scripts);
	const postScripts = useScriptsStore((state) => state.postScripts);
	const getScripts = useScriptsStore((state) => state.getScripts);

	const { id = '' } = useParams();
	const toast = useToast();
	const navigate = useNavigate()
	const colorMode = useColorModeValue('gray.100', 'gray.700');
	const [looksName, setLooksName] = useState(
		props.looks.name
	);
	const [uploads, setUploads] = useState(
		props.looks.files || []
	);
	const [products, setProducts] = useState(
		props.looks.products || []
	);
	const onUploadWidgetClose = (data = []) => {
		setUploads([
			...uploads,
			...data
		])
		onClose();
	}

	const onResourcePickerDone = (data = {}) => {
		setProducts([
			...products.filter(Boolean),
			...data?.selection?.map(d => {
				return {
					title: d.title,
					image: d.images[0] && d.images[0].originalSrc || '',
					id: d.id,
				}
			}).filter(Boolean),
		])
		onResourcePickerClose()
	}

	const getLooskById = async () => {
		if (id) {
			const data = await getLooks({ id });
			console.log("data is ", data)
			if (data) {
				setLooksName(data?.name)
				setUploads([
					...uploads,
					...data?.medias, 
				])
				
				setProducts([
					...products,
					...data?.products.map(p => ({
						id: p.admin_graphql_api_id,
						title: p.title,
						image: p.image.src
					}))
				])
			}
		}
	}

	useEffect(() => {
		getLooskById()
	}, [])

	const removeUpload = (upload, index) => {
		uploads.splice(index, 1)
		setUploads([...uploads.filter(Boolean)])
	}

	const removeProduct = (index) => {
		products.splice(index, 1);
		setProducts([...products.filter(Boolean)])
	}

	const onDestroyLook = async (lookId) => {
		try {
			await destroyLooks(lookId);
			toast({
				title: `Look deleted!`,
				status: 'success'
			});
			window.history.back();
		} catch (e) {
			toast({
				title: e.message || INTERNAL_SERVER_ERROR,
				status: 'error'
			})
		}
	}
	const renderProducts = () => {
		return products.map((product, index) => (
			<Stack id={product.id} key={index} justifyContent="space-between"  direction={'row'} background="white" padding="3" borderRadius="lg" marginBottom="4" align={'center'}>
				<Flex flexDirection="row" alignItems="center">
					<Flex
						w={16}
						h={16}
						align={'center'}
						justify={'center'}
						rounded={'full'}
					>
						<Image objectFit="contain" width="100%" height="100%" src={product.image} color={'yellow.500'} />
					</Flex>
					<Flex direction="column">
						<Text marginLeft="3" fontWeight={600}>{product.title}</Text>
					</Flex>
				</Flex>
				<Icon as={IoClose} color={'red.500'} w={5} h={5} onClick={() => removeProduct(index)} />
			</Stack>
		));
	}
	const renderLooks = () => {
		if (looks.get.loading) {
			return renderSkeleton();
		} else if (looks.get.failure.error) {
			return (
				<Box>
					<Flex direction="column" align="center">
						<VStack spacing="3">
							<Heading as="h1" size="md">{looks.get.failure.message}</Heading>
						</VStack>
						<br />
						<Divider />
						<br />
						<VStack spacing="3">
							<Button onClick={() => getLooskById()}>Try Again</Button>	
						</VStack>
					</Flex>
				</Box>
			)
		} else {
			const { data } = looks?.get?.success;
			return (
				<>
					<Stack spacing={4}>
						<Heading
							color={'gray.800'}
							lineHeight={1.1}
							fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}>
							{data && data.name ? data.name : 'Create a look'}
						</Heading>
						<Text color={'gray.500'} fontSize={{ base: 'sm', sm: 'md' }}>
							Add a name for the look you create and link the products from your store that can form this look.
						</Text>
					</Stack>
					<Box mt={10}>
						<chakra.form
							onSubmit={async (e) => {
								e.preventDefault();
								try {
									if (id) {
									await patchLooks({
											id,
											name: looksName,
											medias: uploads,
											products: products.map(product => product.id),
											
										});
									} else {
										await postLooks({
											name: looksName,
											medias: uploads,
											products: products.map(product => product.id),
										});
										try {
											const scriptsOnStore = await getScripts(shop);
											if (scriptsOnStore && scriptsOnStore.length) {
												// already has a script tag, do nothing.
											} else {
												await postScripts(shop)
											}
											window.history.back()
										} catch (e) {
											window.history.back()

										}
									}
									toast({
										title: `Looks ${id ? 'updated' : 'created'} successfully!`,
										status: 'success'
									})
								} catch (e) {
									toast({
										title: e.message || INTERNAL_SERVER_ERROR,
										status: 'error'
									})
								}
							}}
							{...props}
						>
						<Stack spacing={4}>
							<FormControl id='look-name'>
								<FormLabel>Look name</FormLabel>
								<Input
									placeholder="Winter Fashion Look"
									name="look_name"
									type="text"
									value={looksName}
									onChange={(e) => setLooksName(e.target.value)}
									required
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Add medias to this look</FormLabel>
								<AvatarGroup>
									{uploads.map((upload, index) => (
										<Avatar
											key={(upload._name || upload.name) + index}
											name={upload._name || upload.name}
											src={upload._url || upload.url}
											size="lg"
											// size={useBreakpointValue({ base: 'md', md: 'lg' })}
											position={'relative'}
											zIndex={2}
											_before={{
												content: '""',
												width: 'full',
												height: 'full',
												rounded: 'full',
												transform: 'scale(1.125)',
												bgGradient: 'linear(to-bl, red.400,pink.400)',
												position: 'absolute',
												zIndex: -1,
												top: 0,
												left: 0,
											}}
										>
											<AvatarBadge  boxSize='1.25em' bg='red.500' onClick={() => removeUpload(upload, index)}>
												<Icon as={IoCloseCircleOutline} color={'white.500'} w={5} h={5} />
											</AvatarBadge>
										</Avatar>
									))}
									<Avatar
									onClick={onOpen}
										size="lg"
										bg={'pink.400'}
										_hover={{ bg: 'pink.300' }}
										cursor="pointer"
										icon={<IoAddOutline size="2em" color="white" />}
										_before={{
											content: '""',
											width: 'full',
											height: 'full',
											rounded: 'full',
											transform: 'scale(1.2)',
											bgGradient: 'linear(to-bl, red.400,pink.400)',
											position: 'absolute',
											zIndex: -1,
											top: 0,
											left: 0,
										}}
									>
									</Avatar>
								</AvatarGroup>
								<Upload isOpen={isOpen} onClose={onUploadWidgetClose} />
							</FormControl>
							<br />
							<FormControl id='look-products'>
									<FormLabel>Add products for this look</FormLabel>
									<Stack
										spacing={4}
									>
									{renderProducts()}
									</Stack>
									<Button fontFamily={'heading'} bg={'gray.200'} color={'gray.800'} onClick={onResourcePickerOpen}>
											Link products +
									</Button>
									<ResourcePicker
										onSelection={onResourcePickerDone}
										onCancel={onResourcePickerClose}
										selectMultiple
										showVariants={false}
										resourceType="Product"
										open={isResourcePickerOpen}
										initialSelectionIds={products.map(product => ({ id: product.id })).filter(Boolean)}
									/>
							</FormControl>
						</Stack>
						<ButtonGroup mt={8} width="full">
							{
								data && data.objectId ? (
									<Button
										isLoading={looks.destroy.loading}
										onClick={() => onDestroyLook(data.objectId)}
										isFullWidth
										variant="ghost"
										colorScheme="red"
									>
										Delete Look
									</Button>
								) : null
							}
							<Button
								isLoading={looks.post.loading || looks.patch.loading || scripts.get.loading || scripts.post.loading}
								disabled={looks.post.loading || looks.patch.loading || scripts.get.loading || scripts.post.loading}
								loadingText={`${id ? 'Updating' : 'Saving'} look`}
								type="submit"
								fontFamily={'heading'}
								isFullWidth
								w={'full'}
								bgGradient="linear(to-r, red.400,pink.400)"
								color={'white'}
								_hover={{
									bgGradient: 'linear(to-r, red.400,pink.400)',
									boxShadow: 'xl',
								}}>
								{`${id ? 'Update' : 'Save'} look`}
							</Button>
							
						</ButtonGroup>
					</chakra.form>
					</Box>
				</>
			);
		}
		return null;
		
	}

	return (
		<>
		<NavBar />
		<Box position={'relative'}>
			<Container
				as={SimpleGrid}
				maxW={'7xl'}
				columns={{ base: 1, md: 1 }}
				spacing={{ base: 10, lg: 32 }}
				py={{ base: 10, sm: 15, lg: 20 }}
			>
				
				<Stack
					bg={'gray.50'}
					rounded={'xl'}
					p={{ base: 4, sm: 6, md: 8 }}
					spacing={{ base: 8 }}
					maxW="3xl"
					zIndex="9"
					margin="0 auto"
					width="100%"
				>
					{renderLooks()}
				</Stack>
			</Container>
			<Blur
				position={'absolute'}
				top={30}
				left={-10}
				style={{ filter: 'blur(70px)' }}
			/>
		</Box>
		</>
	);
}
	
	export const Blur = (props) => {
		return (
			<Icon
				width={useBreakpointValue({ base: '100%', md: '40vw', lg: '30vw' })}
				zIndex={useBreakpointValue({ base: -1, md: -1, lg: 0 })}
				height="560px"
				viewBox="0 0 528 560"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				{...props}>
				<circle cx="71" cy="61" r="111" fill="#F56565" />
				<circle cx="244" cy="106" r="139" fill="#ED64A6" />
				<circle cy="291" r="139" fill="#ED64A6" />
				<circle cx="80.5" cy="189.5" r="101.5" fill="#ED8936" />
				<circle cx="196.5" cy="317.5" r="101.5" fill="#ECC94B" />
				<circle cx="70.5" cy="458.5" r="101.5" fill="#48BB78" />
				<circle cx="426.5" cy="-0.5" r="101.5" fill="#4299E1" />
			</Icon>
		);
	};


	CreateLooks.defaultProps = {
		looks: {
			name: ''
		}
	}

	export default CreateLooks;